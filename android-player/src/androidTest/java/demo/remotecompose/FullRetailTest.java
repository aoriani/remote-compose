package demo.remotecompose;
import androidx.test.core.app.ActivityScenario;
import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;
import static org.junit.Assert.*;
import android.os.SystemClock;import android.content.Intent;import android.view.MotionEvent;import android.view.View;import android.graphics.Bitmap;
import java.net.URL;import java.io.FileInputStream;import org.json.*;import org.junit.Test;

/** Full published page, actual pointer gestures and rendered pixel geometry. No component fixture. */
@org.junit.runner.RunWith(androidx.test.ext.junit.runners.AndroidJUnit4.class)
public class FullRetailTest {
    MainActivity activity;float density;int x,y,width;
    void tap(float dx,float dy)throws Exception{long t=SystemClock.uptimeMillis();float px=x+dx*density,py=y+dy*density;getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t,0,px,py,0),true);getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(t,t+70,1,px,py,0),true);SystemClock.sleep(120);}
    void action(float px,float py,String expected)throws Exception{int n=activity.eventCount();tap(px,py);assertEquals("Exactly one event",n+1,activity.eventCount());assertTrue("Expected "+expected+"; actual "+activity.lastEvent(),activity.lastEvent().contains(expected));System.out.println("INTERACTIVE_EVENT "+activity.lastEvent());}
    void shot(String name)throws Exception{
        try(android.os.ParcelFileDescriptor fd=getInstrumentation().getUiAutomation().executeShellCommand("mkdir -p /sdcard/Download/rc-interactive");FileInputStream in=new FileInputStream(fd.getFileDescriptor())){in.readAllBytes();}
        try(android.os.ParcelFileDescriptor fd=getInstrumentation().getUiAutomation().executeShellCommand("screencap -p /sdcard/Download/rc-interactive/"+name+".png");FileInputStream in=new FileInputStream(fd.getFileDescriptor())){in.readAllBytes();}
    }


 void drag(float sx,float sy,float ex,float ey){long start=SystemClock.uptimeMillis();getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(start,start,0,x+sx*density,y+sy*density,0),true);for(int i=1;i<=30;i++){SystemClock.sleep(20);getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(start,SystemClock.uptimeMillis(),2,x+(sx+(ex-sx)*i/30)*density,y+(sy+(ey-sy)*i/30)*density,0),true);}SystemClock.sleep(400);getInstrumentation().getUiAutomation().injectInputEvent(MotionEvent.obtain(start,SystemClock.uptimeMillis(),1,x+ex*density,y+ey*density,0),true);SystemClock.sleep(400);}
 float[] bounds(int color){Bitmap b=getInstrumentation().getUiAutomation().takeScreenshot();int left=b.getWidth(),top=b.getHeight(),right=0,bottom=0;for(int py=y;py<b.getHeight();py++)for(int px=x;px<x+width;px++)if((b.getPixel(px,py)&0xffffff)==color){left=Math.min(left,px);top=Math.min(top,py);right=Math.max(right,px);bottom=Math.max(bottom,py);}b.recycle();assertTrue("Visible product background "+Integer.toHexString(color),bottom-top>90*density);return new float[]{(left-x)/density,(top-y)/density};}
 int filled(float[] b){Bitmap im=getInstrumentation().getUiAutomation().takeScreenshot();int n=0;for(int py=y+(int)((b[1]+8)*density);py<y+(b[1]+36)*density;py++)for(int px=x+(int)((b[0]+122)*density);px<x+(b[0]+152)*density;px++)if((im.getPixel(px,py)&0xffffff)==0xA7286D)n++;im.recycle();return n;}
 @Test public void fullPageInteractions()throws Exception{
  String base="http://127.0.0.1:8092";JSONObject c=new JSONObject(new String(new URL(base+"/samples/full-retail-run.json").openStream().readAllBytes()));
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(new Intent(getInstrumentation().getTargetContext(),MainActivity.class).putExtra("backend",base).putExtra("version",String.valueOf(c.getInt("version"))))){
   scenario.onActivity(a->activity=a);long until=SystemClock.uptimeMillis()+25000;while(!c.getString("sha256").equals(activity.renderedSha())&&SystemClock.uptimeMillis()<until)SystemClock.sleep(100);assertEquals(c.getString("sha256"),activity.renderedSha());SystemClock.sleep(500);
   density=activity.getResources().getDisplayMetrics().density;getInstrumentation().runOnMainSync(()->{View stage=(View)activity.findViewById(R.id.protocol_player).getParent();int[] pos=new int[2];stage.getLocationOnScreen(pos);x=pos[0];y=pos[1];width=stage.getWidth();});float w=width/density;shot("full-top");
   action(w/2-44,716,"name=carousel.select");SystemClock.sleep(550);action(w-44,716,"name=carousel.next");SystemClock.sleep(550);action(100,510,"name=promotion.open value=1");shot("full-slide-two");action(44,716,"name=carousel.previous");SystemClock.sleep(550);action(100,510,"name=promotion.open value=0");action(w/2+44,716,"name=carousel.select");SystemClock.sleep(550);action(100,510,"name=promotion.open value=2");SystemClock.sleep(4500);action(100,510,"name=promotion.open value=0");
   drag(w-10,700,w-10,250);float[] a=bounds(0xE8EDDD),b=bounds(0xF9E5D4);shot("full-products-before");assertEquals(0,filled(a));action(a[0]+137,a[1]+22,"product.oat-milk.favorite value=1");assertTrue(filled(a)>50);action(b[0]+137,b[1]+22,"product.citrus-soda.favorite value=1");action(b[0]+137,b[1]+22,"product.citrus-soda.favorite value=0");action(b[0]+137,b[1]+22,"product.citrus-soda.favorite value=1");action(a[0]+137,a[1]+22,"product.oat-milk.favorite value=0");assertEquals(0,filled(a));assertTrue(filled(b)>50);action(a[0]+137,a[1]+22,"product.oat-milk.favorite value=1");
   action(a[0]+116,a[1]+237,"product.oat-milk.quantity value=1");action(a[0]+148,a[1]+237,"product.oat-milk.quantity value=2");action(a[0]+84,a[1]+237,"product.oat-milk.quantity value=1");action(b[0]+116,b[1]+237,"product.citrus-soda.quantity value=1");action(b[0]+148,b[1]+237,"product.citrus-soda.quantity value=2");action(b[0]+84,b[1]+237,"product.citrus-soda.quantity value=1");shot("full-products-selected");
   drag(w-60,a[1]+100,80,a[1]+100);float[] third=bounds(0xEEE7F5);action(third[0]+137,third[1]+22,"product.granola.favorite value=1");action(third[0]+137,third[1]+22,"product.granola.favorite value=0");action(third[0]+137,third[1]+22,"product.granola.favorite value=1");assertTrue(filled(third)>50);action(third[0]+116,third[1]+237,"product.granola.quantity value=1");action(third[0]+148,third[1]+237,"product.granola.quantity value=2");action(third[0]+84,third[1]+237,"product.granola.quantity value=1");action(third[0]+84,third[1]+237,"product.granola.quantity value=0");shot("full-third-product");assertEquals(c.getString("sha256"),activity.renderedSha());assertEquals(27,activity.eventCount());System.out.println("FULL_RETAIL_DOCUMENT "+activity.renderedSha());
  }
 }
}
