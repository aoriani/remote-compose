package demo.remotecompose;

import android.graphics.Bitmap;
import android.graphics.Rect;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.accessibility.AccessibilityNodeInfo;
import androidx.compose.remote.player.view.RemoteComposePlayer;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import java.io.*;
import java.net.*;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.*;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;

/** Actual device pixels + upstream layout, independent of source header aspect ratio. */
@RunWith(AndroidJUnit4.class)
public class ViewportTest {
    @Rule public ActivityScenarioRule<MainActivity> rule=new ActivityScenarioRule<>(MainActivity.class);
    private void tap(float x,float y){long t=SystemClock.uptimeMillis();getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t,0,x,y,0),true);getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t+80,1,x,y,0),true);}
    @Test public void fillsViewportAndNativeToolbarHasRealTargets() throws Exception {
        ByteArrayOutputStream out=new ByteArrayOutputStream();try(InputStream in=getInstrumentation().getContext().getAssets().open("viewport.rc")){byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1)out.write(b,0,n);}byte[] bytes=out.toByteArray();String sha=Hashes.sha256(bytes);
        ServerSocket server=new ServerSocket(0);Thread responder=new Thread(()->{try{while(!server.isClosed())try(Socket socket=server.accept()){BufferedReader reader=new BufferedReader(new InputStreamReader(socket.getInputStream()));String line;while((line=reader.readLine())!=null&&!line.isEmpty()){}OutputStream wire=socket.getOutputStream();wire.write(("HTTP/1.1 200 OK\r\nContent-Length: "+bytes.length+"\r\nX-Document-Version: 1\r\nX-Document-SHA256: "+sha+"\r\nConnection: close\r\n\r\n").getBytes());wire.write(bytes);wire.flush();}}catch(Exception ignored){}});responder.start();
        try {
            AtomicReference<MainActivity> reference=new AtomicReference<>();rule.getScenario().onActivity(reference::set);MainActivity activity=reference.get();SystemClock.sleep(700);
            getInstrumentation().runOnMainSync(()->activity.testBackend("http://127.0.0.1:"+server.getLocalPort()));long end=SystemClock.uptimeMillis()+20000;while(!sha.equals(activity.renderedSha())&&SystemClock.uptimeMillis()<end)SystemClock.sleep(100);assertEquals(sha,activity.renderedSha());SystemClock.sleep(1200);
            int[] bounds=new int[4];float[] metrics=new float[4];getInstrumentation().runOnMainSync(()->{View player=activity.findViewById(R.id.protocol_player);ViewGroup stage=(ViewGroup)player.getParent();int[] pos=new int[2];stage.getLocationOnScreen(pos);bounds[0]=pos[0];bounds[1]=pos[1];bounds[2]=stage.getWidth();bounds[3]=stage.getHeight();metrics[0]=player.getScaleX();metrics[1]=player.getScaleY();metrics[2]=player.getWidth();metrics[3]=((RemoteComposePlayer)player).getDocument().getDocument().getRootLayoutComponent().getWidth();});
            float density=activity.getResources().getDisplayMetrics().density;
            assertEquals("Only native dp conversion is permitted",density,metrics[0],.0001f);assertEquals(metrics[0],metrics[1],.0001f);assertTrue(metrics[2]*density>=bounds[2]);assertTrue(metrics[2]*density<bounds[2]+density);assertEquals("Root remeasured at logical width",metrics[2],metrics[3],1f);
            Bitmap screen=getInstrumentation().getUiAutomation().takeScreenshot();assertEquals(0xFF203B73,screen.getPixel(bounds[0]+2,bounds[1]+(int)(5*density)));assertEquals("Document paints physical right edge, not native background",0xFF203B73,screen.getPixel(bounds[0]+bounds[2]-2,bounds[1]+(int)(5*density)));
            // Exact circle diameter on both axes: no aspect-ratio stretch.
            int cx=bounds[0]+Math.round(60*density),cy=bounds[1]+Math.round(80*density),horizontal=0,vertical=0;for(int x=cx-(int)(25*density);x<=cx+25*density;x++)if((screen.getPixel(x,cy)&0xFFFFFF)==0x81A884)horizontal++;for(int y=cy-(int)(25*density);y<=cy+25*density;y++)if((screen.getPixel(cx,y)&0xFFFFFF)==0x81A884)vertical++;assertEquals(horizontal,vertical,2);assertEquals(40*density,horizontal,3);screen.recycle();
            AccessibilityNodeInfo root=getInstrumentation().getUiAutomation().getRootInActiveWindow();for(String label:new String[]{"Refresh","Debug and logs"}){AccessibilityNodeInfo target=NativeControls.find(root,label);assertNotNull(label,target);Rect rect=new Rect();target.getBoundsInScreen(rect);assertTrue(label+"48dp target",rect.width()>=48*density-1&&rect.height()>=48*density-1);assertTrue("Toolbar above content",rect.bottom<=bounds[1]);}
            tap(bounds[0]+100*density,bounds[1]+80*density);SystemClock.sleep(300);assertTrue("Engine callback from actual dp-mapped input",activity.eventCount()>0);
            System.out.println("NATIVE_VIEWPORT_PASS physical="+screenWidth(activity)+" stage="+java.util.Arrays.toString(bounds)+" density="+density+" logicalRoot="+metrics[3]+" sha256="+sha);
        } finally {server.close();responder.join(1000);}
    }
    private int screenWidth(MainActivity activity){return activity.getResources().getDisplayMetrics().widthPixels;}
}
