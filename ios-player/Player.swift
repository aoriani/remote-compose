import SwiftUI
import MetalKit
import CryptoKit
import Darwin

private func launchValue(_ name:String)->String? {let args=ProcessInfo.processInfo.arguments;guard let i=args.firstIndex(of:name),i+1<args.count else{return nil};return args[i+1]}

@MainActor final class Viewer: ObservableObject {
    @Published var backend = UserDefaults.standard.string(forKey: "backend") ?? "http://127.0.0.1:8080"
    @Published var auto = true
    @Published var interval = 5.0
    @Published var status = "Loading…"
    @Published var version = "none"
    @Published var digest = ""
    @Published var bytes = 0
    @Published var metadata = ""
    @Published var events: [String] = []
    let device = MTLCreateSystemDefaultDevice()
    var renderer: RCMetalRenderer?
    private let documentSelector = launchValue("--version") ?? "latest"
    private var etag = ""
    private var lastBackend = ""
    private var fetching = false
    private var task: Task<Void,Never>?
    private var smokeDone = false
    init() {
        setbuf(stdout, nil)
        if let value=launchValue("--backend") {backend=value}
        auto = !ProcessInfo.processInfo.arguments.contains("--no-auto")
        if let value=launchValue("--interval"),let seconds=Double(value) {interval=max(2,min(300,seconds))}
        if let device, let queue = device.makeCommandQueue() { renderer = RCMetalRenderer(device: device, commandQueue: queue) }
        renderer?.eventHandler = { [weak self] event in self?.events.append(event); if self?.events.count ?? 0 > 50 { self?.events.removeFirst() }; print("RC_HOST_EVENT \(event)") }
        renderer?.errorHandler = { [weak self] error in self?.status = "Render failed: \(error)"; print("RC_RENDER_ERROR \(error)") }
        if renderer == nil { status = "Metal renderer unavailable; debug controls remain usable" }
    }
    func refresh() async {
        guard !fetching else { return }; fetching = true; defer { fetching = false }
        status = "Fetching…"
        let requestedBackend = backend
        do {
            guard let url = URL(string: backend + "/api/documents/" + documentSelector) else { throw URLError(.badURL) }
            if lastBackend != backend { etag = "" }; lastBackend = backend
            var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
            if !etag.isEmpty { request.setValue(etag, forHTTPHeaderField: "If-None-Match") }
            let (data,response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
            guard requestedBackend == backend else { status = "Backend changed; refresh again"; return }
            if http.statusCode == 304 { version = http.value(forHTTPHeaderField: "X-Document-Version") ?? version; status = "Unchanged"; return }
            guard http.statusCode == 200 else { throw NSError(domain: "HTTP", code: http.statusCode) }
            let sha = SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
            if let expected = http.value(forHTTPHeaderField: "X-Document-SHA256"), expected != sha { throw NSError(domain: "Digest mismatch", code: 1) }
            guard let renderer, renderer.loadFileData(data) else { throw NSError(domain: "Player rejected document (last valid retained)", code: 2) }
            bytes = data.count; digest = sha; version = http.value(forHTTPHeaderField: "X-Document-Version") ?? "unknown"
            etag = http.value(forHTTPHeaderField: "ETag") ?? ""; status = "Decoded; rendering"
            print("RC_DOCUMENT version=\(version) sha256=\(digest) bytes=\(bytes)")
            if let metaURL = URL(string: backend + "/api/documents/\(version)/metadata"), let (body,_) = try? await URLSession.shared.data(from: metaURL) { metadata = String(data: body, encoding: .utf8) ?? "" }
            if ProcessInfo.processInfo.arguments.contains("--smoke") && !smokeDone {
                smokeDone = true
                Task {
                    try? await Task.sleep(nanoseconds: 700_000_000)
                    renderer.sendClickX(100, y: 25)
                    let original = backend; let old = digest; backend = "http://127.0.0.1:1"
                    await refresh()
                    print("RC_REFRESH_PRESERVED \(old == digest && status.contains("failed"))")
                    backend = original
                }
            }
        } catch { status = "Refresh failed (last document retained): \(error.localizedDescription)"; print("RC_FETCH_ERROR \(error)") }
    }
    func start() { guard task == nil else { return }; task = Task { await refresh(); while !Task.isCancelled { try? await Task.sleep(nanoseconds: UInt64(max(2,min(300,interval))*1_000_000_000)); if Task.isCancelled { return }; if auto { await refresh() } } } }
    func stop() { task?.cancel(); task = nil }
}

struct ProtocolSurface: UIViewRepresentable {
    @ObservedObject var model: Viewer
    func makeCoordinator() -> Coordinator { Coordinator(model) }
    func makeUIView(context: Context) -> MTKView {
        let view = MTKView(frame: .zero, device: model.device)
        view.framebufferOnly = false; view.colorPixelFormat = .bgra8Unorm; view.preferredFramesPerSecond = 60
        view.delegate = context.coordinator
        let tap = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.tap(_:)))
        let pan = UIPanGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.pan(_:)))
        view.addGestureRecognizer(tap); view.addGestureRecognizer(pan)
        return view
    }
    func updateUIView(_ uiView: MTKView, context: Context) {}
    @MainActor final class Coordinator: NSObject, MTKViewDelegate {
        let model: Viewer; var elapsed = 0.0; var last = CACurrentMediaTime()
        init(_ model: Viewer) { self.model = model }
        func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}
        func draw(in view: MTKView) { let now=CACurrentMediaTime();let dt=now-last;last=now;elapsed+=dt;model.renderer?.draw(in:view,animTime:elapsed,deltaTime:dt) }
        func point(_ g: UIGestureRecognizer) -> CGPoint { guard let view=g.view else{return .zero};let size=model.renderer?.documentSize() ?? CGSize(width:390,height:844);let p=g.location(in:view);let scale=min(view.bounds.width/max(1,size.width),view.bounds.height/max(1,size.height));return CGPoint(x:(p.x-(view.bounds.width-size.width*scale)/2)/scale,y:(p.y-(view.bounds.height-size.height*scale)/2)/scale) }
        @objc func tap(_ g: UITapGestureRecognizer) { let p=point(g);model.renderer?.sendTouchDownX(Float(p.x),y:Float(p.y));model.renderer?.sendClickX(Float(p.x),y:Float(p.y));model.renderer?.sendTouchUpX(Float(p.x),y:Float(p.y),velX:0,velY:0) }
        @objc func pan(_ g: UIPanGestureRecognizer) { let p=point(g);let r=model.renderer;switch g.state {case .began:r?.sendTouchDownX(Float(p.x),y:Float(p.y));case .changed:r?.sendTouchDragX(Float(p.x),y:Float(p.y));case .ended,.cancelled:r?.sendTouchUpX(Float(p.x),y:Float(p.y),velX:0,velY:0);default:break} }
    }
}
struct PlayerScreen: View {
    @StateObject var model=Viewer()
    @State var debug=false
    @Environment(\.scenePhase) var phase
    var body: some View {
        VStack(spacing:8) {
            HStack { Text("Remote Compose").font(.headline);Spacer();Button("Refresh"){Task{await model.refresh()}};Button("Debug"){debug=true} }.padding(.horizontal)
            Text("\(model.status) • v\(model.version) • \(model.bytes) bytes").font(.caption).accessibilityIdentifier("fetch-status")
            ProtocolSurface(model:model).accessibilityIdentifier("remote-document")
        }.sheet(isPresented:$debug) {
            NavigationStack { Form {
                Section("Connection") { TextField("Backend URL",text:$model.backend).textInputAutocapitalization(.never).autocorrectionDisabled();Toggle("Auto-refresh",isOn:$model.auto);Stepper("Interval: \(Int(model.interval)) seconds",value:$model.interval,in:2...300);Button("Refresh now"){UserDefaults.standard.set(model.backend,forKey:"backend");Task{await model.refresh()}} }
                Section("Document") { Text("Version \(model.version) • \(model.bytes) bytes");Text("SHA-256 \(model.digest)").font(.caption).textSelection(.enabled).accessibilityIdentifier("document-digest").accessibilityValue(model.digest);Text(model.status);DisclosureGroup("Raw document metadata") { Text(model.metadata).font(.system(.caption,design:.monospaced)).textSelection(.enabled) } }
                Section("Host events") { Button("Clear event log"){model.events=[]};ForEach(Array(model.events.enumerated()),id:\.offset){ _,event in Text(event) } }
            }.navigationTitle("Player debug").toolbar { Button("Done"){debug=false} } }.presentationDetents([.medium,.large])
        }.task { model.start() }.onChange(of:phase){ _,value in if value == .active {model.start()} else {model.stop()} }
    }
}
@main struct RemoteComposeApp: App { var body: some Scene { WindowGroup { PlayerScreen() } } }
