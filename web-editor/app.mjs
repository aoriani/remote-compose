import {catalog,createWidget,initialDocument,sections,setSections,recognize,patch,operate} from './model.mjs';
const $ = s=>document.querySelector(s);
let selected=0, player=null, serial=0, events=[], previewSource=null, busy=false;
const source=$('#source');source.value=localStorage.getItem('rc-draft')||JSON.stringify(initialDocument(),null,2);
window.rcProof={events,ready:false};
function message(value,error=false){$('#status').textContent=typeof value==='string'?value:JSON.stringify(value,null,2);$('#status').classList.toggle('error',error);}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function highlight(){const s=source.value;const pattern=/"(?:\\.|[^"\\])*"\s*(?=:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/g;let out='',last=0;for(const m of s.matchAll(pattern)){out+=esc(s.slice(last,m.index));const cls=m[0].startsWith('"')?(/:\s*$/.test(s.slice(m.index+m[0].length,m.index+m[0].length+1))?'key':'string'):'literal';out+=`<span class="${cls}">${esc(m[0])}</span>`;last=m.index+m[0].length;}$('#highlight').innerHTML=out+esc(s.slice(last))+'\n';$('#highlight').scrollTop=source.scrollTop;}
function draftState(){const stale=source.value!==previewSource;$('#draft-state').textContent=stale?'Draft changed • preview required':'Preview matches draft';$('#draft-state').classList.toggle('stale',stale);}
function save(doc){source.value=JSON.stringify(doc,null,2);localStorage.setItem('rc-draft',source.value);highlight();outline(doc);draftState();}
function current(){return JSON.parse(source.value);}
function change(action){try{const doc=current();action(doc);save(doc);message('Draft updated. Preview to compile.');}catch(e){message(String(e),true);}}
function outline(doc=current()){selected=Math.max(0,Math.min(selected,sections(doc).length-1));$('#outline').replaceChildren();sections(doc).forEach((node,i)=>{const b=document.createElement('button');b.textContent=`${i+1}. ${recognize(node).label}`;b.classList.toggle('selected',i===selected);b.onclick=()=>{selected=i;try{outline(current());}catch(e){message(String(e),true);}};const li=document.createElement('li');li.append(b);$('#outline').append(li);});properties(doc);}
function properties(doc){const node=sections(doc)[selected];const container=$('#properties');container.replaceChildren();if(!node)return;const known=recognize(node);const title=document.createElement('h2');title.textContent=known.label;container.append(title);if(!known.id){const p=document.createElement('p');p.textContent='This is a custom primitive composition. Edit its JSON; moving or deleting it preserves other sections.';container.append(p);}for(const field of known.fields){const label=document.createElement('label');label.textContent=field.label;const input=document.createElement('input');input.value=field.value;input.type=field.type;input.onchange=()=>change(d=>{const target=sections(d)[selected];if(recognize(target).id!==known.id)throw Error('Structure changed; edit as custom JSON.');const value=field.type==='number'?input.valueAsNumber:input.value;if(field.type==='number'&&!Number.isFinite(value))throw Error('Enter a finite number.');patch(target,field.path,value);});label.append(input);container.append(label);}}
async function preview(publish=false){
 if(busy)return;
 const request=++serial, submitted=source.value;
 let candidate=null;
 busy=true;
 for(const id of ['preview','refresh','publish','apply'])$('#'+id).disabled=true;
 try{
  // Send even malformed JSON to the JVM for its consistent path/line diagnostics.
  message(publish?'Compiling and publishing…':'Validating and compiling…');
  const response=await fetch(publish?'/api/publish':'/api/compile',{method:'POST',headers:{'Content-Type':'application/json'},body:submitted});
  if(!response.ok){const body=await response.text();try{throw JSON.parse(body);}catch(e){if(e?.errors)throw e;throw Error(`HTTP ${response.status}: ${body.slice(0,300)}`);}}
  if(publish){
   const metadata=await response.json();
   $('#metadata').textContent=`Published v${metadata.version} • ${metadata.bytes} bytes`;
   message({...metadata,note:source.value===submitted?'Published submitted draft. Preview is separate.':'Published submitted snapshot; current draft has newer edits.'});
   window.rcProof.published=metadata;return;
  }
  const bytes=await response.arrayBuffer();
  if(request!==serial||source.value!==submitted){message('Draft changed during compilation. Preview again.');return;}
  const canvas=document.createElement('canvas');canvas.width=390;canvas.height=844;
  candidate=new RC.RcdPlayer(canvas);candidate.setDensity(1);
  const decoded=await candidate.loadFromArrayBuffer(bytes);
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  if(request!==serial||source.value!==submitted){candidate.stop();candidate=null;message('Draft changed during compilation. Preview again.');return;}
  const log=event=>{events.push(event);events=events.slice(-50);window.rcProof.events=events;$('#events').textContent=JSON.stringify(events,null,2);};
  decoded.addIdActionListener({onAction(id,metadata){log({id,metadata});}});
  decoded.addActionCallback({onAction(name,value){log({name,value});}});
  player?.stop();player=candidate;candidate=null;$('#phone').replaceChildren(canvas);
  previewSource=submitted;
  window.rcProof={...window.rcProof,ready:true,sha256:digest,bytes:bytes.byteLength,events};delete window.rcProof.lastError;
  $('#metadata').textContent=`Preview • ${bytes.byteLength} bytes`;
  message(`Valid document • ${bytes.byteLength} bytes\nSHA-256 ${digest}`);outline();
 }catch(e){candidate?.stop();message(e?.errors?e:String(e),true);window.rcProof.lastError=e?.errors||String(e);}
 finally{busy=false;for(const id of ['preview','refresh','publish','apply'])$('#'+id).disabled=false;draftState();}
}
for(const item of catalog){const b=document.createElement('button');b.textContent=`+ ${item.label}`;b.dataset.template=item.id;b.onclick=()=>change(doc=>{const list=sections(doc).slice();list.push(createWidget(item.id));setSections(doc,list);selected=list.length-1;});$('#palette').append(b);}
for(const b of document.querySelectorAll('[data-op]'))b.onclick=()=>change(doc=>{selected=operate(doc,selected,b.dataset.op);});
$('#preview').onclick=()=>preview();$('#refresh').onclick=()=>preview();$('#publish').onclick=()=>preview(true);$('#apply').onclick=()=>preview();
$('#format').onclick=()=>{try{save(current());}catch(e){message(String(e),true);}};
$('#reset').onclick=()=>{selected=0;save(initialDocument());preview();};
$('#load-published').onclick=async()=>{try{const r=await fetch('/api/documents/latest/source');if(!r.ok)throw Error('No published document');source.value=await r.text();selected=0;save(current());preview();}catch(e){message(String(e),true);}};
$('#download').onclick=()=>{const url=URL.createObjectURL(new Blob([source.value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='remote-compose.json';a.click();URL.revokeObjectURL(url);};
$('#clear-events').onclick=()=>{events=[];window.rcProof.events=events;$('#events').textContent='Events cleared';};
function tab(json){$('#json-panel').style.display=json?'block':'none';$('#properties').style.display=json?'none':'block';$('#json-tab').classList.toggle('active',json);$('#properties-tab').classList.toggle('active',!json);}
$('#json-tab').onclick=()=>tab(true);$('#properties-tab').onclick=()=>tab(false);tab(false);
source.oninput=()=>{highlight();localStorage.setItem('rc-draft',source.value);draftState();};source.onscroll=()=>{$('#highlight').scrollTop=source.scrollTop;};
function fitPhone(){const scale=Math.min(Number($('#zoom').value),Math.max(.2,($('.preview').clientWidth-32)/406));$('#phone').style.transform=`scale(${scale})`;$('.phone-frame').style.width=`${406*scale}px`;$('.phone-frame').style.height=`${860*scale}px`;}
$('#zoom').onchange=fitPhone;new ResizeObserver(fitPhone).observe($('.preview'));fitPhone();
highlight();try{outline();preview();}catch(e){message(String(e),true);tab(true);}
