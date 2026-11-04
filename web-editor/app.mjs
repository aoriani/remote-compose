import {initializeNestedText} from './player-adapter.mjs';
import {moveCarouselSlide} from './interactive.mjs';
import {catalog,createWidget,initialDocument,legacyDesignedDocument,startingSource,sections,setSections,recognize,patch,operate,assetSlots,updateField} from './model.mjs';
const $ = s=>document.querySelector(s);
let selected=0, player=null, serial=0, events=[], previewSource=null, busy=false, library=[], activeAsset='oat-milk', propertySection=-1;
const source=$('#source'), savedDraft=localStorage.getItem('rc-draft');source.value=startingSource(savedDraft);
if(savedDraft&&source.value!==savedDraft){if(!localStorage.getItem('rc-draft-before-interactive-default'))localStorage.setItem('rc-draft-before-interactive-default',savedDraft);localStorage.setItem('rc-draft',source.value);}
window.rcProof={events,ready:false};
function message(value,error=false){$('#status').textContent=typeof value==='string'?value:JSON.stringify(value,null,2);$('#status').classList.toggle('error',error);if(error)$('#diagnostics').open=true;draftState();}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function highlight(){
 const lines=source.value.split('\n'),lineHeight=17,start=Math.max(0,Math.floor(source.scrollTop/lineHeight)-2),count=Math.ceil((source.clientHeight||660)/lineHeight)+5;
 const s=lines.slice(start,start+count).join('\n');
 const pattern=/"(?:\\.|[^"\\])*"\s*(?=:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/g;
 let out='',last=0;
 for(const m of s.matchAll(pattern)){out+=esc(s.slice(last,m.index));const cls=m[0].startsWith('"')?(s[m.index+m[0].length]===':'?'key':'string'):'literal';out+=`<span class="${cls}">${esc(m[0])}</span>`;last=m.index+m[0].length;}
 const pre=$('#highlight'),width=Math.max(1,lines.reduce((max,line)=>Math.max(max,line.length),0))*6.1;
 pre.innerHTML=`<div style="height:${lines.length*lineHeight}px;width:${width}px;position:relative"><div style="position:absolute;top:${start*lineHeight}px;left:0">${out+esc(s.slice(last))}\n</div></div>`;
 pre.scrollTop=source.scrollTop;pre.scrollLeft=source.scrollLeft;
}
function draftState(){const stale=source.value!==previewSource;$('#draft-state').textContent=stale?'Draft changed • preview required':'Preview matches draft';$('#draft-state').classList.toggle('stale',stale);const mode=busy?'busy':$('#status').classList.contains('error')?'error':stale?'stale':'valid';$('.compile-summary').dataset.state=mode;$('#compile-state').textContent={busy:'Compiling document…',error:'Needs attention',stale:'Preview out of date',valid:'Document validated'}[mode];}
function save(doc){source.value=JSON.stringify(doc,null,2);localStorage.setItem('rc-draft',source.value);highlight();outline(doc);draftState();}
function current(){return JSON.parse(source.value);}
function change(action){try{const doc=current();action(doc);save(doc);message('Draft updated. Preview to compile.');}catch(e){message(String(e),true);}}
function outline(doc=current()){selected=Math.max(0,Math.min(selected,sections(doc).length-1));$('#outline').replaceChildren();sections(doc).forEach((node,i)=>{const b=document.createElement('button');const known=recognize(node);const firstText=node?.commands?.find(c=>c.type?.toLowerCase()==='drawtextanchored')?.text||node?.value;b.textContent=`${i+1}. ${known.id?known.label:firstText?`Custom composition · ${firstText}`:known.label}`;b.classList.toggle('selected',i===selected);b.setAttribute('aria-pressed',String(i===selected));b.onclick=()=>{selected=i;try{outline(current());}catch(e){message(String(e),true);}};const li=document.createElement('li');li.append(b);$('#outline').append(li);});properties(doc);$('#replace-asset').disabled=!assetSlots(sections(doc)[selected]).length;}
function properties(doc){const previousSlot=propertySection===selected?Number($('#asset-target')?.value||0):0;propertySection=selected;const node=sections(doc)[selected];const container=$('#properties');container.replaceChildren();if(!node)return;const known=recognize(node);const title=document.createElement('h2');title.textContent=known.label;container.append(title);if(!known.id){const p=document.createElement('p');p.textContent='This is a custom primitive composition. Edit its JSON; moving or deleting it preserves other sections.';container.append(p);}for(const field of known.fields){const label=document.createElement('label');label.textContent=field.label;const input=document.createElement(field.type==='asset'?'select':'input');if(field.type==='asset'){for(const item of library){const opt=document.createElement('option');opt.value=item.id;opt.textContent=item.label;input.append(opt);}if(!library.some(x=>x.id===field.value)){const opt=document.createElement('option');opt.value=field.value;opt.textContent=field.value;input.append(opt);}}else {input.type=field.type;if(field.type==='number')input.step='any';}if(field.options){input.min=field.options.min;input.max=field.options.max;}input.value=field.value;input.onchange=()=>change(d=>{const target=sections(d)[selected];if(recognize(target).id!==known.id)throw Error('Structure changed; edit as custom JSON.');const value=field.type==='number'?input.valueAsNumber:input.value;if(field.type==='number'&&!Number.isFinite(value))throw Error('Enter a finite number.');updateField(target,field,value);});label.append(input);container.append(label);}if(known.id==='carousel'){
 const heading=document.createElement('h3');heading.textContent='Banner order';container.append(heading);
 for(let i=0;i<node.children[14].value;i++){
  const line=document.createElement('div');line.textContent=`Banner ${i+1} `;
  for(const [label,delta] of [['↑',-1],['↓',1]]){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',`Move banner ${i+1} ${delta<0?'up':'down'}`);b.disabled=i+delta<0||i+delta>=node.children[14].value;b.onclick=()=>change(d=>moveCarouselSlide(sections(d)[selected],i,delta));line.append(b);}container.append(line);
 }
 }const slots=assetSlots(node);if(slots.length){const h=document.createElement('h3');h.textContent='Image resources';h.style.cssText='font-size:10px;border-top:1px solid #e8ebef;padding-top:20px;margin-top:24px';container.append(h);const select=document.createElement('select');select.id='asset-target';select.setAttribute('aria-label','Image to replace');slots.forEach((slot,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${library.find(x=>x.id===slot.value)?.label||slot.value}`;select.append(o);});select.value=String(Math.min(previousSlot,slots.length-1));const label=document.createElement('label');label.textContent='Replacement target';label.append(select);container.append(label);const im=document.createElement('img');im.className='asset-slot-preview';im.alt='Selected image resource';const update=()=>{const item=library.find(x=>x.id===slots[Number(select.value)].value);im.src=item?'/assets/'+item.file:'/assets/club-bag.png';};select.onchange=update;update();container.append(im);const help=document.createElement('p');help.className='asset-help';help.textContent='Choose an asset in the Library, then Replace selected. Only this bitmap reference changes.';container.append(help);}}
async function preview(publish=false,publishedVersion=null){
 if(busy)return;
 const request=++serial, submitted=source.value;
 let candidate=null;
 busy=true;
 for(const id of ['preview','refresh','publish','apply'])$('#'+id).disabled=true;
 try{
  // Send even malformed JSON to the JVM for its consistent path/line diagnostics.
  message(publish?'Compiling and publishing…':'Validating and compiling…');
  const response=publishedVersion?await fetch(`/api/documents/${publishedVersion}`):await fetch(publish?'/api/publish':'/api/compile',{method:'POST',headers:{'Content-Type':'application/json'},body:submitted});
  if(!response.ok){const body=await response.text();try{throw JSON.parse(body);}catch(e){if(e?.errors)throw e;throw Error(`HTTP ${response.status}: ${body.slice(0,300)}`);}}
  if(publish){
   const metadata=await response.json();
   $('#metadata').textContent=`Published v${metadata.version} • ${metadata.bytes} bytes`;
   message({...metadata,note:source.value===submitted?'Published submitted draft. Preview is separate.':'Published submitted snapshot; current draft has newer edits.'});
   window.rcProof.published=metadata;return;
  }
  const bytes=await response.arrayBuffer();
  if(request!==serial||source.value!==submitted){message('Draft changed during compilation. Preview again.');return;}
  const canvas=document.createElement('canvas');canvas.width=390;canvas.height=844;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Remote Compose binary preview; pointer drag to scroll. Rendered document keyboard semantics are not exposed.');
  candidate=new RC.RcdPlayer(canvas);candidate.setDensity(1);
  const decoded=await candidate.loadFromArrayBuffer(bytes);
  initializeNestedText(candidate,decoded);
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  if(request!==serial||source.value!==submitted){candidate.stop();candidate=null;message('Draft changed during compilation. Preview again.');return;}
  const log=event=>{$('.events-panel').open=true;events.push(event);events=events.slice(-50);window.rcProof.events=events;$('#events').textContent=JSON.stringify(events,null,2);};
  decoded.addIdActionListener({onAction(id,metadata){log({id,metadata});}});
  decoded.addActionCallback({onAction(name,value){log({name,value});}});
  player?.stop();player=candidate;candidate=null;$('#phone').replaceChildren(canvas);
  previewSource=submitted;
  window.rcProof={...window.rcProof,ready:true,sha256:digest,bytes:bytes.byteLength,events};delete window.rcProof.lastError;
  $('#metadata').textContent=publishedVersion?`Published v${publishedVersion} • ${bytes.byteLength} bytes`:`Preview • ${bytes.byteLength} bytes`;window.rcProof.loadedVersion=publishedVersion;
  message(`Valid document • ${bytes.byteLength} bytes\nSHA-256 ${digest}`);outline();
 }catch(e){candidate?.stop();message(e?.errors?e:String(e),true);window.rcProof.lastError=e?.errors||String(e);}
 finally{busy=false;for(const id of ['preview','refresh','publish','apply'])$('#'+id).disabled=false;draftState();}
}
const glyphs={carousel:'M3 5h18v12H3z M8 21h1M12 21h1M16 21h1',header:'M4 5h16v14H4z M4 10h16',text:'M5 5h14M12 5v14M8 19h8',spacer:'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4',hero:'M3 4h18v16H3z M3 16l5-5 4 4 3-3 6 6',promo:'M4 6h16v12H4z M8 10h8M8 14h5',image:'M3 3h18v18H3z M4 17l6-7 4 4 3-3 4 6',button:'M3 7h18v10H3z M9 12h6',products:'M2 5h5v14H2z M10 5h5v14h-5z M18 5h4v14h-4z',news:'M3 4h8v16H3z M14 4h7v16h-7z',badge:'M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3z',progress:'M3 8h18v8H3z M4 9h10v6H4z'};
for(const item of catalog){const b=document.createElement('button');b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="'+glyphs[item.id]+'"/></svg>';const name=document.createElement('span');name.textContent=item.label;b.append(name);b.dataset.template=item.id;b.onclick=()=>change(doc=>{const list=sections(doc).slice();const next=createWidget(item.id);if(item.id==='carousel'&&JSON.stringify(doc).includes('promo_interval'))throw Error('A promotional carousel already declares this variable namespace. Use raw JSON with explicitly renamed variables for another instance.');list.push(next);setSections(doc,list);selected=list.length-1;});$('#palette').append(b);}
for(const b of document.querySelectorAll('[data-op]'))b.onclick=()=>change(doc=>{selected=operate(doc,selected,b.dataset.op);});
$('#preview').onclick=()=>preview();$('#refresh').onclick=()=>preview();$('#publish').onclick=()=>preview(true);$('#apply').onclick=()=>preview();
$('#format').onclick=()=>{try{save(current());}catch(e){message(String(e),true);}};
$('#reset').onclick=()=>{selected=0;save(initialDocument());preview();};
$('#load-published').onclick=async()=>{try{const metadataResponse=await fetch('/api/documents/latest/metadata');if(!metadataResponse.ok)throw Error('No published document');const metadata=await metadataResponse.json();const r=await fetch(`/api/documents/${metadata.version}/source`);if(!r.ok)throw Error('Published source unavailable');source.value=await r.text();selected=0;save(current());await preview(false,metadata.version);}catch(e){message(String(e),true);}};
$('#download').onclick=()=>{const url=URL.createObjectURL(new Blob([source.value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='remote-compose.json';a.click();URL.revokeObjectURL(url);};
$('#clear-events').onclick=()=>{events=[];window.rcProof.events=events;$('#events').textContent='Events cleared';};
function tab(json){$('#json-panel').style.display=json?'block':'none';$('#properties').style.display=json?'none':'block';$('#json-tab').setAttribute('aria-pressed',String(json));$('#properties-tab').setAttribute('aria-pressed',String(!json));$('#json-tab').classList.toggle('active',json);$('#properties-tab').classList.toggle('active',!json);}
$('#json-tab').onclick=()=>tab(true);$('#properties-tab').onclick=()=>tab(false);tab(false);
source.oninput=()=>{highlight();localStorage.setItem('rc-draft',source.value);draftState();};source.onscroll=highlight;
function fitPhone(){const scale=Math.min(Number($('#zoom').value),Math.max(.2,($('.preview').clientWidth-32)/406));$('#phone').style.transform=`scale(${scale})`;$('.phone-frame').style.width=`${406*scale}px`;$('.phone-frame').style.height=`${860*scale}px`;}
$('#zoom').onchange=fitPhone;new ResizeObserver(fitPhone).observe($('.preview'));fitPhone();
highlight();try{outline();preview();}catch(e){message(String(e),true);tab(true);}

function gallery(){const q=$('#asset-search').value.toLowerCase();$('#asset-gallery').replaceChildren();const matches=library.filter(item=>`${item.label} ${item.brand} ${item.category}`.toLowerCase().includes(q));$('#asset-count').textContent=`${matches.length} originals`;$('#insert-asset').disabled=matches.length===0;$('#insert-asset').title='Insert '+(library.find(x=>x.id===activeAsset)?.label||'asset');if(!matches.length){const empty=document.createElement('p');empty.textContent='No matching assets. Try oat, citrus, or granola.';empty.style.gridColumn='1 / -1';$('#asset-gallery').append(empty);}for(const item of matches){const b=document.createElement('button');b.className='asset-card';b.classList.toggle('selected',item.id===activeAsset);b.setAttribute('aria-pressed',String(item.id===activeAsset));b.dataset.asset=item.id;b.title=`Select ${item.label}`;const art=document.createElement('div');art.className='asset-art';art.style.background=item.color;const im=document.createElement('img');im.src='/assets/'+item.file;im.alt=item.label;art.append(im);const label=document.createElement('b');label.textContent=item.label;const small=document.createElement('small');small.textContent=item.brand;b.append(art,label,small);b.onclick=()=>{activeAsset=item.id;gallery();};$('#asset-gallery').append(b);}}
$('#asset-search').oninput=gallery;
$('#insert-asset').onclick=()=>change(doc=>{const list=sections(doc).slice(),node=createWidget('image');patch(node,assetSlots(node)[0].path,activeAsset);list.push(node);setSections(doc,list);selected=list.length-1;});
$('#replace-asset').onclick=()=>change(doc=>{const node=sections(doc)[selected],slots=assetSlots(node),index=Number($('#asset-target')?.value||0);if(!slots[index])throw Error('Select a section containing a bitmap first.');patch(node,slots[index].path,activeAsset);});
fetch('/assets/library.json').then(r=>{if(!r.ok)throw Error('Asset library unavailable');return r.json();}).then(items=>{library=items;gallery();try{outline();}catch{}}).catch(e=>message(String(e),true));

$('#rail-library').onclick=()=>$('.library').scrollTo({top:0,behavior:'smooth'});
$('#rail-json').onclick=()=>{tab(true);$('#json-panel').scrollIntoView({block:'nearest'});source.focus();};
$('#rail-layers').onclick=()=>$('#outline').scrollIntoView({block:'start',behavior:'smooth'});

$('#legacy-design').onclick=()=>{selected=0;save(legacyDesignedDocument());preview();};
