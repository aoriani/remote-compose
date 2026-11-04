package demo.remotecompose;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.compose.remote.player.view.RemoteComposePlayer;

/** Maps legacy API7 protocol pixels to native dp, never to the header's aspect ratio.
 * The upstream player measures the available logical viewport on every size change.
 * ceil covers a fractional dp at the physical right/bottom pixel; the host clips only
 * that normal <1dp raster boundary, not an authored 390x844 document.
 */
public final class ProtocolViewport extends ViewGroup {
    public ProtocolViewport(Context context) { super(context); setClipChildren(true); }
    @Override protected void onMeasure(int widthSpec, int heightSpec) {
        int width=MeasureSpec.getSize(widthSpec),height=MeasureSpec.getSize(heightSpec);
        setMeasuredDimension(width,height);
        float density=getResources().getDisplayMetrics().density;
        for(int i=0;i<getChildCount();i++) {
            getChildAt(i).measure(MeasureSpec.makeMeasureSpec((int)Math.ceil(width/density),MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec((int)Math.ceil(height/density),MeasureSpec.EXACTLY));
        }
    }
    @Override protected void onLayout(boolean changed,int l,int t,int r,int b) {
        float density=getResources().getDisplayMetrics().density;
        for(int i=0;i<getChildCount();i++) {
            View child=getChildAt(i);child.layout(0,0,child.getMeasuredWidth(),child.getMeasuredHeight());
            child.setPivotX(0);child.setPivotY(0);child.setScaleX(density);child.setScaleY(density);
        }
        postDelayed(this::recordBounds,300);
    }
    String metrics() {
        if(getChildCount()==0)return "No player";
        View child=getChildAt(0);float density=getResources().getDisplayMetrics().density;
        String root="";
        if(child instanceof RemoteComposePlayer){androidx.compose.remote.core.operations.layout.RootLayoutComponent layout=((RemoteComposePlayer)child).getDocument().getDocument().getRootLayoutComponent();if(layout!=null)root=" rootWidth="+layout.getWidth()+" rootHeight="+layout.getHeight();}
        return "density="+density+" logicalWidth="+(getWidth()/density)+" logicalHeight="+(getHeight()/density)+" playerWidth="+child.getWidth()+" playerHeight="+child.getHeight()+root+" headerFit=false";
    }
    void recordBounds() {
        if(getChildCount()==0)return;
        View child=getChildAt(0);int[] p=new int[2];getLocationOnScreen(p);
        float density=getResources().getDisplayMetrics().density;
        android.util.Log.i("RC_VIEWPORT","x="+p[0]+" y="+p[1]+" width="+getWidth()+" height="+getHeight()
            +" "+metrics());
    }
}
