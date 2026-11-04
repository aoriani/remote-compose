package demo.remotecompose;

import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.graphics.Color;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.*;
import androidx.compose.remote.player.view.RemoteComposePlayer;
import androidx.compose.remote.player.core.RemoteDocument;
import androidx.compose.remote.core.operations.Header;
import java.io.ByteArrayInputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
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
    private TextView debugText;
    private Dialog debugSheet;
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
        PlayerChrome.install(this,chrome,stage,this::refresh,this::debug);
        showState();refresh();
    }
    @Override protected void onResume(){super.onResume();active=true;ui.removeCallbacks(timer);ui.postDelayed(timer,interval*1000L);}
    @Override protected void onPause(){super.onPause();active=false;ui.removeCallbacks(timer);}
    @Override protected void onDestroy(){if(debugSheet!=null)debugSheet.dismiss();if(actionToast!=null)actionToast.cancel();network.shutdownNow();super.onDestroy();}
    private void showState(){chrome.setStatus(state+" • version "+version+" • "+size+" bytes");if(debugText!=null)debugText.setText(details());}
    private String details(){return "Backend: "+backend+"\nVersion: "+version+"\n"+header+"\nBytes: "+size+"\nSHA-256: "+sha+"\nViewport: "+stage.metrics()+"\nStatus: "+state+"\n\nHost events:\n"+String.join("\n",events);}
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
    private void debug(){if(debugSheet!=null&&debugSheet.isShowing())return;Dialog sheet=new Dialog(this);debugSheet=sheet;LinearLayout body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);body.setPadding(20,20,20,20);EditText url=new EditText(this);url.setSingleLine();url.setText(backend);url.setContentDescription("Backend URL");body.addView(url);EditText seconds=new EditText(this);seconds.setInputType(2);seconds.setText(Integer.toString(interval));seconds.setContentDescription("Refresh interval seconds");body.addView(seconds);CheckBox toggle=new CheckBox(this);toggle.setText("Auto-refresh");toggle.setChecked(auto);body.addView(toggle);
        Button apply=new Button(this);apply.setText("Apply and refresh now");apply.setOnClickListener(v->{try{String next=url.getText().toString().replaceAll("/+$","");new URL(next);int nextInterval=Integer.parseInt(seconds.getText().toString());if(nextInterval<2||nextInterval>300)throw new Exception("Interval must be 2..300");if(!backend.equals(next))etag="";backend=next;interval=nextInterval;auto=toggle.isChecked();getPreferences(0).edit().putString("backend",backend).putInt("interval",interval).putBoolean("auto",auto).apply();refresh();}catch(Exception e){state=e.getMessage();showState();}});body.addView(apply);
        Button clear=new Button(this);clear.setText("Clear events");clear.setOnClickListener(v->{events.clear();showState();});body.addView(clear);debugText=new TextView(this);debugText.setTextIsSelectable(true);ScrollView scroll=new ScrollView(this);scroll.addView(debugText);body.addView(scroll,new LinearLayout.LayoutParams(-1,600));sheet.setContentView(body);sheet.getWindow().setLayout(-1,-2);sheet.getWindow().setGravity(Gravity.BOTTOM);sheet.setOnDismissListener(v->{debugText=null;debugSheet=null;});showState();sheet.show();sheet.getWindow().setLayout(-1,-2);
    }
}
