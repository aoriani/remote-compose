#import "RCMetalRenderer.h"

#import <Metal/Metal.h>

#include <chrono>

#include "rccore/WireBuffer.h"
#include "rccore/CoreDocument.h"
#include "rccore/RemoteContext.h"
#include "rccore/TimeVariables.h"
#include "rccore/operations/DrawOperations.h"

// The pinned C++ action containers skip their DATA pass. HostAction.write emits
// the action name as nested DATA_TEXT, so preload immutable text definitions at
// every depth before interaction. No actions or drawing operations are executed.
static void loadNestedText(rccore::RemoteContext& context,
        const std::vector<std::unique_ptr<rccore::Operation>>& operations) {
    for (const auto& op : operations) {
        if (auto* text = dynamic_cast<rccore::TextData*>(op.get()))
            context.loadText(text->textId, text->text);
        loadNestedText(context, op->mChildren);
    }
}
#include "rcskia/SkiaPaintContext.h"

#include "include/core/SkCanvas.h"
#include "include/core/SkColorSpace.h"
#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrBackendSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/ganesh/SkSurfaceGanesh.h"
#include "include/gpu/ganesh/mtl/GrMtlBackendContext.h"
#include "include/gpu/ganesh/mtl/GrMtlBackendSurface.h"
#include "include/gpu/ganesh/mtl/GrMtlDirectContext.h"
#include "include/gpu/ganesh/mtl/GrMtlTypes.h"

@implementation RCMetalRenderer {
    id<MTLDevice> _device;
    id<MTLCommandQueue> _queue;
    sk_sp<GrDirectContext> _grContext;

    std::unique_ptr<rccore::CoreDocument> _doc;
    std::unique_ptr<rccore::RemoteContext> _context;
    std::unique_ptr<rcskia::SkiaPaintContext> _paintCtx;
    rccore::TimeVariables _timeVars;
    std::vector<uint8_t> _fileData;

    CGSize _authoredSize;
    CGSize _lastSurfaceSize;  // tracks when RemoteContext needs re-sizing
}

- (instancetype)initWithDevice:(id<MTLDevice>)device
                  commandQueue:(id<MTLCommandQueue>)queue {
    self = [super init];
    if (!self) return nil;
    _device = device;
    _queue = queue;

    GrMtlBackendContext backendCtx;
    backendCtx.fDevice.retain((__bridge GrMTLHandle)_device);
    backendCtx.fQueue.retain((__bridge GrMTLHandle)_queue);
    _grContext = GrDirectContexts::MakeMetal(backendCtx);
    if (!_grContext) {
        NSLog(@"[RCMetalRenderer] Failed to create GrDirectContext");
        return nil;
    }
    return self;
}

- (void)dealloc {
    if (_grContext) _grContext->abandonContext();
}

- (BOOL)loadFileData:(NSData *)data {
    std::vector<uint8_t> bytes((const uint8_t *)data.bytes, (const uint8_t *)data.bytes + data.length);
    rccore::WireBuffer buffer(bytes.data(), bytes.size());
    auto candidate = std::make_unique<rccore::CoreDocument>();
    try {
        if (!candidate->initFromBuffer(buffer)) return NO;
        _paintCtx = nullptr;
        _context = nullptr;
        _authoredSize = CGSizeMake(candidate->getWidth(), candidate->getHeight());
        _doc = std::move(candidate);
        _fileData = std::move(bytes);
        _lastSurfaceSize = CGSizeZero;
        return YES;
    } catch (const std::exception &e) {
        if (self.errorHandler) self.errorHandler([NSString stringWithUTF8String:e.what()]);
        return NO;
    }
}

- (CGSize)documentSize {
    if (!_doc) return CGSizeZero;
    return CGSizeMake(_doc->getWidth(), _doc->getHeight());
}

- (void)setupContextForSize:(CGSize)size {
    if (!_doc) return;
    // API7 protocol coordinates are logical points here. Re-measure the available
    // viewport, never the header's design-time aspect ratio. Preserve local state on resize.
    if (_context) {
        _context->mWidth = size.width;
        _context->mHeight = size.height;
        _lastSurfaceSize = size;
        return;
    }
    _context = std::make_unique<rccore::RemoteContext>();
    _paintCtx = std::make_unique<rcskia::SkiaPaintContext>(*_context, nullptr);
    _context->setPaintContext(_paintCtx.get());
    _context->setDocument(_doc.get());
    __weak RCMetalRenderer *weakSelf = self;
    _context->hostAction = [weakSelf](int id, const std::string& metadata) {
        RCMetalRenderer *owner = weakSelf;
        if (owner.eventHandler) owner.eventHandler([NSString stringWithFormat:@"id=%d metadata=%s", id, metadata.c_str()]);
    };
    _context->hostNamedAction = [weakSelf](const std::string& name, int type, const std::string& value) {
        RCMetalRenderer *owner = weakSelf;
        if (owner.eventHandler) owner.eventHandler([NSString stringWithFormat:@"name=%s type=%d value=%s", name.c_str(), type, value.c_str()]);
    };

    // Layout in the actual available point viewport; Retina conversion happens at draw.
    _context->mWidth = size.width;
    _context->mHeight = size.height;

    _doc->registerListeners(*_context);
    _doc->applyDataOperations(*_context);
    loadNestedText(*_context, _doc->getOperations());
    _timeVars = rccore::TimeVariables();
    _lastSurfaceSize = size;
}

- (void)drawInView:(MTKView *)view
          animTime:(double)animTime
         deltaTime:(double)deltaTime {
    if (!_doc || !_grContext) return;

    id<CAMetalDrawable> drawable = view.currentDrawable;
    if (!drawable) return;
    id<MTLTexture> texture = drawable.texture;
    if (!texture) return;

    CGSize drawableSize = CGSizeMake(texture.width, texture.height);

    CGSize viewport = view.bounds.size;
    if (viewport.width <= 0 || viewport.height <= 0) return;
    BOOL resized = !_context || !CGSizeEqualToSize(viewport, _lastSurfaceSize);
    if (resized) [self setupContextForSize:viewport];
    // This is only the device point-to-pixel conversion, not a document fit or stretch.
    float pixelRatioX = drawableSize.width / viewport.width;
    float pixelRatioY = drawableSize.height / viewport.height;
    if (resized) NSLog(@"RC_VIEWPORT physical=%.0fx%.0f logical=%.3fx%.3f density=%.3fx%.3f root=%.3fx%.3f authored=%.0fx%.0f render=0,0,%.0f,%.0f headerFit=false",
        drawableSize.width,drawableSize.height,viewport.width,viewport.height,pixelRatioX,pixelRatioY,
        _context->mWidth,_context->mHeight,_authoredSize.width,_authoredSize.height,drawableSize.width,drawableSize.height);

    try {
        // Wrap the drawable's texture as a Skia render target so we can draw
        // straight into it, then present via our own command buffer below.
        GrMtlTextureInfo textureInfo;
        textureInfo.fTexture.retain((__bridge GrMTLHandle)texture);

        GrBackendRenderTarget backendRT = GrBackendRenderTargets::MakeMtl(
            (int)texture.width, (int)texture.height, textureInfo);

        sk_sp<SkSurface> surface = SkSurfaces::WrapBackendRenderTarget(
            _grContext.get(),
            backendRT,
            kTopLeft_GrSurfaceOrigin,
            kBGRA_8888_SkColorType,
            /*colorSpace=*/nullptr,
            /*surfaceProps=*/nullptr);

        if (!surface) {
            NSLog(@"[RCMetalRenderer] WrapBackendRenderTarget returned null");
            return;
        }

        SkCanvas *canvas = surface->getCanvas();
        canvas->clear(SK_ColorBLACK);
        canvas->save();
        canvas->scale(pixelRatioX, pixelRatioY);

        _paintCtx->setCanvas(canvas);
        // Root layout and window variables see the actual point viewport.
        _timeVars.updateTime(*_context, animTime, deltaTime);
        _doc->paint(*_context);

        canvas->restore();

        // Flush Skia work into the command queue, then present the drawable.
        _grContext->flushAndSubmit(GrSyncCpu::kNo);

        id<MTLCommandBuffer> cmd = [_queue commandBuffer];
        [cmd presentDrawable:drawable];
        [cmd commit];
    } catch (const std::exception &e) {
        NSLog(@"[RCMetalRenderer] Render error: %s", e.what());
        if (self.errorHandler) self.errorHandler([NSString stringWithUTF8String:e.what()]);
    }
}

- (BOOL)needsAnimation {
    if (!_context) return NO;

    // getRepaintDelay now takes the wall clock, because the repaint schedule is computed
    // against absolute time rather than treating animation time as always-advancing.
    const int64_t nowMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
    if (_context->getRepaintDelay(nowMs) > 0) return YES;

    // A document can also ask for the next frame itself, and that request is the only thing
    // driving an animation the schedule knows nothing about. A fling is the case that
    // matters: on touch-up TouchExpression configures an easing curve and then calls
    // needsRepaint() each frame until it runs out. Ignore it and the fling dies the instant
    // the finger lifts, with no error and no visible cause. apps/viewer carries the same
    // check and the same reason.
    if (rccore::PaintContext *pc = _context->getPaintContext()) {
        if (pc->doesNeedsRepaint()) return YES;
    }
    return NO;
}

- (void)sendClickX:(float)x y:(float)y {
    if (_doc && _context) _doc->onClick(*_context, x, y);
}

- (void)sendTouchDownX:(float)x y:(float)y {
    if (!_doc || !_context) return;
    _doc->touchDown(*_context, x, y);
}

- (void)sendTouchDragX:(float)x y:(float)y {
    if (!_doc || !_context) return;
    _doc->touchDrag(*_context, x, y);
}

- (void)sendTouchUpX:(float)x y:(float)y velX:(float)dx velY:(float)dy {
    if (!_doc || !_context) return;
    _doc->touchUp(*_context, x, y, dx, dy);
}

@end
