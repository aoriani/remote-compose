package demo.remotecompose;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.compose.remote.player.view.RemoteComposePlayer;
import androidx.compose.remote.player.core.RemoteDocument;
import androidx.compose.remote.core.operations.Header;
import java.io.ByteArrayInputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

/** Generic protocol viewer. Everything business-specific arrives in the document. */
public class MainActivity extends androidx.activity.ComponentActivity {
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService network = Executors.newSingleThreadExecutor();
    private final ArrayList<String> events = new ArrayList<>();
    private ProtocolViewport stage;
    private final PlayerChrome.State chrome = new PlayerChrome.State();
    private Toast actionToast;
    private void actionFeedback(String event){if(actionToast!=null)actionToast.cancel();actionToast=Toast.makeText(this,event,Toast.LENGTH_SHORT);actionToast.show();}
    private RemoteComposePlayer player;
    private volatile String backend="http://127.0.0.1:8080", etag="", version="none", sha="", header="", state="Loading…";
    private String documentSelector="latest";
    private int size=0, interval=5, authoredWidth=390, authoredHeight=844;
    private boolean auto=true, fetching=false, active=false;
    private final Runnable timer = new Runnable() { public void run(){ if(active&&auto)refresh();if(active)ui.postDelayed(this,interval*1000L); } };
    @Override public void onCreate(Bundle saved){super.onCreate(saved);
        backend=getPreferences(0).getString("backend",backend);if(getIntent().hasExtra("backend"))backend=getIntent().getStringExtra("backend");if(getIntent().hasExtra("version"))documentSelector=getIntent().getStringExtra("version");if(!documentSelector.matches("latest|[1-9][0-9]*"))documentSelector="latest";auto=getPreferences(0).getBoolean("auto",true);interval=getPreferences(0).getInt("interval",5);
        stage=new ProtocolViewport(this);
        PlayerChrome.install(this,chrome,stage,this::refresh,this::debug,new DebugActions() {
            public void apply(String url,int seconds,boolean enabled){applySettings(url,seconds,enabled);}
            public void clearEvents(){events.clear();showState();}
        });
        showState();refresh();
    }
    @Override protected void onResume(){super.onResume();active=true;ui.removeCallbacks(timer);ui.postDelayed(timer,interval*1000L);}
    @Override protected void onPause(){super.onPause();active=false;ui.removeCallbacks(timer);}
    @Override protected void onDestroy(){if(actionToast!=null)actionToast.cancel();network.shutdownNow();super.onDestroy();}
    private void showState(){
        chrome.setStatus(state+" • version "+version+" • "+size+" bytes");
        chrome.setDebugInfo(new DebugInfo(backend,interval,auto,version,size,sha,header,stage.metrics(),state,fetching,new ArrayList<>(events)));
    }
    private void refresh(){if(fetching)return;fetching=true;state="Fetching…";showState();final String base=backend,oldTag=etag;network.execute(()->{
        try{HttpURLConnection c=(HttpURLConnection)new URL(base+"/api/documents/"+documentSelector).openConnection();c.setConnectTimeout(5000);c.setReadTimeout(10000);if(!oldTag.isEmpty())c.setRequestProperty("If-None-Match",oldTag);int code=c.getResponseCode();if(code==304){String currentVersion=c.getHeaderField("X-Document-Version");c.disconnect();ui.post(()->{if(!backend.equals(base)){fetching=false;refresh();return;}if(currentVersion!=null)version=currentVersion;state="Unchanged";fetching=false;showState();});return;}if(code!=200)throw new Exception("HTTP "+code);
            java.io.ByteArrayOutputStream buffer=new java.io.ByteArrayOutputStream();try(java.io.InputStream input=c.getInputStream()){byte[] block=new byte[8192];int count;while((count=input.read(block))!=-1)buffer.write(block,0,count);}byte[] bytes=buffer.toByteArray();String receivedVersion=c.getHeaderField("X-Document-Version"),receivedTag=c.getHeaderField("ETag"),expected=c.getHeaderField("X-Document-SHA256");c.disconnect();String digest=Hashes.sha256(bytes);if(expected!=null&&!expected.equals(digest))throw new Exception("Binary digest mismatch");RemoteDocument doc=new RemoteDocument(bytes);Header h=Header.readDirect(new ByteArrayInputStream(bytes));
            ui.post(()->{if(!backend.equals(base)){fetching=false;refresh();return;}try{android.content.res.Configuration virtualConfig=new android.content.res.Configuration(getResources().getConfiguration());virtualConfig.densityDpi=160;RemoteComposePlayer candidate=new RemoteComposePlayer(createConfigurationContext(virtualConfig));candidate.setId(R.id.protocol_player);candidate.setDocument(doc);if(candidate.getDocument()==null)throw new Exception("Player rejected document");doc.getDocument().addActionCallback((name,value)->{events.add("name="+name+" value="+value);if(events.size()>50)events.remove(0);android.util.Log.i("RC_HOST_EVENT",events.get(events.size()-1));actionFeedback(events.get(events.size()-1));showState();});candidate.addIdActionListener((id,metadata)->{events.add("id="+id+" metadata="+metadata);if(events.size()>50)events.remove(0);android.util.Log.i("RC_HOST_EVENT",events.get(events.size()-1));actionFeedback(events.get(events.size()-1));showState();});authoredWidth=h.getInt(Header.DOC_WIDTH,390);authoredHeight=h.getInt(Header.DOC_HEIGHT,844);stage.removeAllViews();stage.addView(candidate,new ViewGroup.LayoutParams(-1,-1));player=candidate;stage.requestLayout();version=receivedVersion;etag=receivedTag==null?"":receivedTag;sha=digest;size=bytes.length;header=h.toString();state="Rendered";android.util.Log.i("RC_DOCUMENT","version="+version+" sha256="+sha+" bytes="+size);}catch(Exception e){state="Render failed: "+e.getMessage();}fetching=false;showState();});
        }catch(Exception e){ui.post(()->{if(!backend.equals(base)){fetching=false;refresh();return;}state="Refresh failed (last document retained): "+e.getMessage();fetching=false;showState();});}
    });}
    String renderedSha(){return sha;}
    String fetchStatus(){return state;}
    int eventCount(){return events.size();}
    String lastEvent(){return events.isEmpty()?"":events.get(events.size()-1);}
    void testBackend(String url){backend=url;etag="";auto=false;refresh();}
    private void debug(){showState();chrome.setDebugVisible(true);}
    private void applySettings(String url,int seconds,boolean enabled){
        if(!backend.equals(url))etag="";
        backend=url;interval=seconds;auto=enabled;
        getPreferences(0).edit().putString("backend",backend).putInt("interval",interval).putBoolean("auto",auto).apply();
        // Apply the new cadence immediately; never keep a stale scheduled interval.
        ui.removeCallbacks(timer);if(active)ui.postDelayed(timer,interval*1000L);
        showState();refresh();
    }
}
