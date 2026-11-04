package demo.remotecompose;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;
import static org.junit.Assert.*;
import org.junit.Test;import org.junit.Rule;import org.junit.runner.RunWith;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import java.net.ServerSocket;
import java.net.Socket;
import java.io.*;

/** Real HTTP bytes, official player input, callback, and failed-refresh preservation. */
@RunWith(AndroidJUnit4.class)
public class ViewerTest {
    @Rule public ActivityScenarioRule<MainActivity> rule = new ActivityScenarioRule<>(MainActivity.class);
    @Test public void testFetchEventAndFailurePreservesDocument() throws Exception {
        ByteArrayOutputStream out=new ByteArrayOutputStream();try(InputStream in=getInstrumentation().getContext().getAssets().open("button.rc")){byte[] b=new byte[1024];int n;while((n=in.read(b))!=-1)out.write(b,0,n);}byte[] bytes=out.toByteArray();String sha=Hashes.sha256(bytes);
        ServerSocket server=new ServerSocket(0);Thread responder=new Thread(()->{try{while(!server.isClosed()){try(Socket s=server.accept()){BufferedReader reader=new BufferedReader(new InputStreamReader(s.getInputStream()));String line;while((line=reader.readLine())!=null&&!line.isEmpty()){}OutputStream wire=s.getOutputStream();wire.write(("HTTP/1.1 200 OK\r\nContent-Length: "+bytes.length+"\r\nX-Document-Version: 1\r\nX-Document-SHA256: "+sha+"\r\nConnection: close\r\n\r\n").getBytes());wire.write(bytes);wire.flush();}}}catch(Exception ignored){}});responder.start();
        try{java.util.concurrent.atomic.AtomicReference<MainActivity> reference=new java.util.concurrent.atomic.AtomicReference<>();rule.getScenario().onActivity(reference::set);MainActivity activity=reference.get();SystemClock.sleep(1000);getInstrumentation().runOnMainSync(()->activity.testBackend("http://127.0.0.1:"+server.getLocalPort()));long end=SystemClock.uptimeMillis()+20000;while(!sha.equals(activity.renderedSha())&&SystemClock.uptimeMillis()<end)SystemClock.sleep(100);assertEquals(sha,activity.renderedSha());SystemClock.sleep(500);
            getInstrumentation().runOnMainSync(()->{View p=activity.findViewById(R.id.protocol_player);long t=SystemClock.uptimeMillis();p.dispatchTouchEvent(MotionEvent.obtain(t,t,MotionEvent.ACTION_DOWN,100,25,0));p.dispatchTouchEvent(MotionEvent.obtain(t,t+50,MotionEvent.ACTION_UP,100,25,0));});end=SystemClock.uptimeMillis()+3000;while(activity.eventCount()==0&&SystemClock.uptimeMillis()<end)SystemClock.sleep(100);assertTrue("HostAction should reach native listener",activity.eventCount()>0);
            getInstrumentation().runOnMainSync(()->activity.testBackend("http://127.0.0.1:1"));end=SystemClock.uptimeMillis()+10000;while(!activity.fetchStatus().contains("failed")&&SystemClock.uptimeMillis()<end)SystemClock.sleep(100);assertTrue(activity.fetchStatus().contains("failed"));assertEquals(sha,activity.renderedSha());
        }finally{server.close();responder.join(1000);}
    }
    private byte[] asset(String name) throws Exception {
        try(InputStream in=getInstrumentation().getContext().getAssets().open(name);ByteArrayOutputStream out=new ByteArrayOutputStream()){byte[] b=new byte[1024];int n;while((n=in.read(b))!=-1)out.write(b,0,n);return out.toByteArray();}
    }
    private void nativeClick(String label){
        android.view.accessibility.AccessibilityNodeInfo target=null;
        for(int i=0;i<50&&target==null;i++){android.view.accessibility.AccessibilityNodeInfo root=getInstrumentation().getUiAutomation().getRootInActiveWindow();target=NativeControls.find(root,label);if(target==null)SystemClock.sleep(100);}
        assertNotNull("Native toolbar control "+label,target);android.graphics.Rect bounds=new android.graphics.Rect();target.getBoundsInScreen(bounds);long t=SystemClock.uptimeMillis();getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t,MotionEvent.ACTION_DOWN,bounds.centerX(),bounds.centerY(),0),true);getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t+80,MotionEvent.ACTION_UP,bounds.centerX(),bounds.centerY(),0),true);getInstrumentation().waitForIdleSync();SystemClock.sleep(500);
    }
    private void waitSha(MainActivity a,String sha){long end=SystemClock.uptimeMillis()+20000;while(!sha.equals(a.renderedSha())&&SystemClock.uptimeMillis()<end)SystemClock.sleep(100);assertEquals(sha,a.renderedSha());}
    private int screenPixel(MainActivity a,int x,int y){
        getInstrumentation().waitForIdleSync();SystemClock.sleep(700);
        int[] point=new int[2];getInstrumentation().runOnMainSync(()->{View v=a.findViewById(R.id.protocol_player);v.getLocationOnScreen(point);point[0]+=Math.round(x*v.getScaleX());point[1]+=Math.round(y*v.getScaleY());});android.graphics.Bitmap screenshot=getInstrumentation().getUiAutomation().takeScreenshot();assertNotNull(screenshot);int color=screenshot.getPixel(point[0],point[1]);screenshot.recycle();return color;
    }
    @Test public void testManualAutoAndCorruptRefreshRecovery() throws Exception {
        android.content.SharedPreferences prefs=getInstrumentation().getTargetContext().getSharedPreferences("MainActivity",0);java.util.Map<String,?> originalPreferences=prefs.getAll();
        byte[] a=asset("button.rc"),b=asset("circle.rc");String hashA=Hashes.sha256(a),hashB=Hashes.sha256(b);
        java.util.concurrent.atomic.AtomicReference<byte[]> current=new java.util.concurrent.atomic.AtomicReference<>(a);
        java.util.concurrent.atomic.AtomicInteger mode=new java.util.concurrent.atomic.AtomicInteger(0);
        ServerSocket server=new ServerSocket(0);
        Thread responder=new Thread(()->{try{while(!server.isClosed()){try(Socket socket=server.accept()){
            BufferedReader reader=new BufferedReader(new InputStreamReader(socket.getInputStream()));String line;while((line=reader.readLine())!=null&&!line.isEmpty()){}
            byte[] bytes=mode.get()==2?new byte[]{1,2,3}:current.get();String code=mode.get()==1?"503 Unavailable":"200 OK";
            OutputStream out=socket.getOutputStream();out.write(("HTTP/1.1 "+code+"\r\nContent-Length: "+bytes.length+"\r\nX-Document-Version: "+(current.get()==a?1:2)+"\r\nX-Document-SHA256: "+Hashes.sha256(bytes)+"\r\nConnection: close\r\n\r\n").getBytes());out.write(bytes);out.flush();
        }}}catch(Exception ignored){}});responder.start();
        try{java.util.concurrent.atomic.AtomicReference<MainActivity> ref=new java.util.concurrent.atomic.AtomicReference<>();rule.getScenario().onActivity(ref::set);MainActivity activity=ref.get();SystemClock.sleep(500);
            getInstrumentation().runOnMainSync(()->activity.testBackend("http://127.0.0.1:"+server.getLocalPort()));waitSha(activity,hashA);
            current.set(b);SystemClock.sleep(700);assertEquals("Manual mode must retain A before refresh",hashA,activity.renderedSha());
            nativeClick("Refresh");waitSha(activity,hashB);
            // Enable the actual native debug controls, not an alternate timer implementation.
            nativeClick("Debug and logs");
            // Compose exposes virtual descendants; click the actual switch and button.
            nativeClick("Auto-refresh");
            nativeClick("Apply and refresh now");
            getInstrumentation().sendKeyDownUpSync(android.view.KeyEvent.KEYCODE_BACK);getInstrumentation().waitForIdleSync();SystemClock.sleep(1000);current.set(a);waitSha(activity,hashA);SystemClock.sleep(500);int retainedPixel=screenPixel(activity,100,25);
            mode.set(2);long end=SystemClock.uptimeMillis()+15000;while(!activity.fetchStatus().contains("failed")&&SystemClock.uptimeMillis()<end)SystemClock.sleep(100);assertTrue(activity.fetchStatus().contains("failed"));assertEquals(hashA,activity.renderedSha());assertEquals("Corrupt refresh must retain the actual visible document pixel",retainedPixel,screenPixel(activity,100,25));
            mode.set(0);current.set(b);waitSha(activity,hashB);SystemClock.sleep(500);assertEquals("Recovered binary must visibly paint its circle",0xFF0067A0,screenPixel(activity,195,160));
        }finally{server.close();responder.join(1000);android.content.SharedPreferences.Editor restore=prefs.edit();for(String key:new String[]{"backend","auto","interval"}){Object value=originalPreferences.get(key);if(value==null)restore.remove(key);else if(value instanceof String)restore.putString(key,(String)value);else if(value instanceof Boolean)restore.putBoolean(key,(Boolean)value);else if(value instanceof Integer)restore.putInt(key,(Integer)value);}restore.commit();}
    }

}
