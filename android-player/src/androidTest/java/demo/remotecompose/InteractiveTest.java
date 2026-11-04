package demo.remotecompose;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.core.app.ActivityScenario;
import androidx.test.platform.app.InstrumentationRegistry;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;
import static org.junit.Assert.*;
import org.junit.Test;import org.junit.runner.RunWith;
import android.os.SystemClock;import android.content.Intent;import android.view.MotionEvent;import android.view.View;import android.graphics.Bitmap;
import java.net.URL;import java.io.*;import java.util.concurrent.atomic.AtomicReference;import org.json.*;

@RunWith(AndroidJUnit4.class)
public class InteractiveTest {
    MainActivity activity;float density;int x,y,width;
    void tap(float dx,float dy)throws Exception{long t=SystemClock.uptimeMillis();float px=x+dx*density,py=y+dy*density;getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t,0,px,py,0),true);getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t+70,1,px,py,0),true);SystemClock.sleep(120);}
    void action(float px,float py,String expected)throws Exception{int n=activity.eventCount();tap(px,py);assertEquals("Exactly one event",n+1,activity.eventCount());assertTrue("Expected "+expected+"; actual "+activity.lastEvent(),activity.lastEvent().contains(expected));System.out.println("INTERACTIVE_EVENT "+activity.lastEvent());}
    void shot(String name)throws Exception{
        try(android.os.ParcelFileDescriptor fd=getInstrumentation().getUiAutomation().executeShellCommand("mkdir -p /sdcard/Download/rc-interactive");FileInputStream in=new FileInputStream(fd.getFileDescriptor())){in.readAllBytes();}
        try(android.os.ParcelFileDescriptor fd=getInstrumentation().getUiAutomation().executeShellCommand("screencap -p /sdcard/Download/rc-interactive/"+name+".png");FileInputStream in=new FileInputStream(fd.getFileDescriptor())){in.readAllBytes();}
    }

    @Test public void publishedJsonAndLocalActions()throws Exception{
        String base="http://127.0.0.1:8092";JSONArray cases=new JSONObject(new String(new URL(base+"/samples/interactive-run.json").openStream().readAllBytes())).getJSONArray("cases");
        for(int i=0;i<cases.length();i++){
            JSONObject c=cases.getJSONObject(i);Intent intent=new Intent(getInstrumentation().getTargetContext(),MainActivity.class).putExtra("backend",base).putExtra("version",String.valueOf(c.getInt("version")));
            try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(intent)){
                scenario.onActivity(a->activity=a);long deadline=SystemClock.uptimeMillis()+20000;while(!c.getString("sha256").equals(activity.renderedSha())&&SystemClock.uptimeMillis()<deadline)SystemClock.sleep(100);assertEquals(c.getString("sha256"),activity.renderedSha());SystemClock.sleep(400);
                density=activity.getResources().getDisplayMetrics().density;getInstrumentation().runOnMainSync(()->{View stage=(View)activity.findViewById(R.id.protocol_player).getParent();int[] pos=new int[2];stage.getLocationOnScreen(pos);x=pos[0];y=pos[1];width=stage.getWidth();});float w=width/density;
                shot(c.getString("id")+"-initial");
                if(i!=1){
                    action(w/2-44,286,"name=carousel.select");int offset=Math.round(Float.parseFloat(activity.lastEvent().split("value=")[1]));SystemClock.sleep(550);
                    action(w-44,286,"name=carousel.next value="+(offset+1));SystemClock.sleep(550);action(100,80,"name=promotion.open value=1");
                    action(44,286,"name=carousel.previous value="+offset);SystemClock.sleep(550);action(100,80,"name=promotion.open value=0");
                    action(w/2+44,286,"name=carousel.select value="+(offset+2));SystemClock.sleep(550);action(100,80,"name=promotion.open value=2");
                    SystemClock.sleep(5000);action(100,80,"name=promotion.open value=0");
                    action(48,594,"name=favorite.change value=1");action(48,594,"name=favorite.change value=0");
                    action(164,392,"name=category.select value=Breakfast");action(268,392,"name=category.select value=Pantry");
                    action(w-44,594,"name=cart.add value=1");action(w-44,594,"name=cart.add value=2");action(w-140,594,"name=cart.quantity value=1");
                    action(70,470,"name=product.open value=field-oat");action(80,646,"name=scan.open value=scan-and-go");action(100,695,"name=membership.open value=common-market");
                    shot(c.getString("id")+"-interacted");
                    int before=activity.eventCount();scenario.moveToState(androidx.lifecycle.Lifecycle.State.STARTED);SystemClock.sleep(5200);scenario.moveToState(androidx.lifecycle.Lifecycle.State.RESUMED);SystemClock.sleep(500);assertEquals("Resume must not replay actions",before,activity.eventCount());action(w-44,594,"name=cart.add value=2");
                }
                System.out.println("INTERACTIVE_DOCUMENT "+c.getString("id")+" sha256="+activity.renderedSha());
            }
        }
    }
    @Test public void favoriteHasVisibleNativeFeedback()throws Exception{
        String base="http://127.0.0.1:8092";JSONArray cases=new JSONObject(new String(new URL(base+"/samples/interactive-run.json").openStream().readAllBytes())).getJSONArray("cases");JSONObject c=cases.getJSONObject(cases.length()-1);
        Intent intent=new Intent(getInstrumentation().getTargetContext(),MainActivity.class).putExtra("backend",base).putExtra("version",String.valueOf(c.getInt("version")));
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(intent)){
            scenario.onActivity(a->activity=a);long deadline=SystemClock.uptimeMillis()+20000;while(!c.getString("sha256").equals(activity.renderedSha())&&SystemClock.uptimeMillis()<deadline)SystemClock.sleep(100);assertEquals(c.getString("sha256"),activity.renderedSha());SystemClock.sleep(500);
            density=activity.getResources().getDisplayMetrics().density;getInstrumentation().runOnMainSync(()->{View stage=(View)activity.findViewById(R.id.protocol_player).getParent();int[] pos=new int[2];stage.getLocationOnScreen(pos);x=pos[0];y=pos[1];width=stage.getWidth();});
            Bitmap before=getInstrumentation().getUiAutomation().takeScreenshot();action(48,594,"name=favorite.change value=1");SystemClock.sleep(300);Bitmap after=getInstrumentation().getUiAutomation().takeScreenshot();int changed=0,selected=0;for(int py=y+(int)(578*density);py<y+614*density;py++)for(int px=(int)(30*density);px<66*density;px++){if(before.getPixel(px,py)!=after.getPixel(px,py))changed++;if((after.getPixel(px,py)&0xffffff)==0xA7286D)selected++;}assertTrue("Heart pixels must change",changed>50);assertTrue("Selected vector fill must be rendered",selected>50);before.recycle();after.recycle();shot("favorite-selected");
        }
    }

}
