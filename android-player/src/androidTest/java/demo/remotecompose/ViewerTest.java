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
}
