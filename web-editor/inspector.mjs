import {recognize} from './model.mjs';
import {atPath,pathLabel,sectionPaths,normalized,mapLayouts,visibleBounds,hitLayout} from './selection.mjs';

export function createInspector({getSource,getDocument,getSelected,selectSection,save,compile,message,showTab,highlight,onPendingChange}) {
 const $=s=>document.querySelector(s),input=$('#component-source');
 let busyState=false;
 let path=null,base=null,original='',mode='interact',entries=[],mappingSource=null,mappingError='',frame=0;
 let recovered=null;try{recovered=JSON.parse(localStorage.getItem('rc-component-draft'));}catch{}
 const pending=()=>input.value!==original;
 const persist=()=>{if(pending())localStorage.setItem('rc-component-draft',JSON.stringify({path,base,original,text:input.value,index:getSelected()}));else localStorage.removeItem('rc-component-draft');};
 const notice=()=>{
  $('#component-state').textContent=pending()?(base===getSource()?'Unapplied component edits · Apply or discard before selecting another component.':'The document changed. Copy your component edits before discarding; they cannot overwrite newer document changes.'):'Component matches document.';
  $('#component-discard').disabled=!pending();onPendingChange?.();
 };
 function sync(doc,selected=getSelected()){
  if(pending()){notice();return;}
  if(!doc){try{doc=getDocument();}catch{message('Fix the document JSON before inspecting a component.',true);return;}}
  const sections=sectionPaths(doc),section=sections[selected];
  if(!path||!atPath(doc,path)||!section||!section.every((v,i)=>path[i]===v))path=section||null;
  const node=path?atPath(doc,path):null;
  original=node?JSON.stringify(node,null,2):'';input.value=original;base=getSource();
  const known=node?recognize(node):null;$('#component-title').textContent=node?(known.id?known.label:`${normalized(node).type||'Primitive'} · ${path.length>section?.length?'Nested component':'Page section'}`):'No component selected';
  $('#component-path').textContent=path?pathLabel(path):'Choose a layer or click the canvas in Select mode.';
  input.disabled=!node;$('#component-apply').disabled=busyState||!node;$('#component-document').disabled=!node;
  $('#component-parent').disabled=!path||path.length<=1;
  highlight(input,$('#component-highlight'));notice();updateBox();
  if(recovered&&Array.isArray(recovered.path)&&typeof recovered.text==='string'&&typeof recovered.original==='string'){const saved=recovered;recovered=null;path=saved.path;base=saved.base;original=saved.original;input.value=saved.text;$('#component-title').textContent='Recovered component draft';$('#component-path').textContent=pathLabel(path);selectSection(saved.index||0);notice();highlight(input,$('#component-highlight'));showTab('component');}
 }
 function guard(){if(!pending())return true;message('Apply or discard your component JSON edits first. They have been preserved.',true);showTab('component');return false;}
 function choose(next){
  if(!guard())return;
  const doc=getDocument(),sections=sectionPaths(doc),index=sections.findIndex(p=>p.every((v,i)=>next[i]===v));
  // Root parents may sit outside the section list. They remain inspectable as document JSON.
  if(index<0){message('This parent is the document root. Use Document JSON to edit it.');showTab('document');return;}
  path=next;selectSection(index);sync(doc,index);showTab('component');
  $('#outline button.selected')?.scrollIntoView({block:'nearest'});
 }
 function updateBox(){
  const box=$('#selection-box');if(!box)return;
  const same=getSource()===mappingSource,entry=entries.find(e=>JSON.stringify(e.path)===JSON.stringify(path));
  box.hidden=mode!=='select'||!same||!entry||(pending()&&base!==getSource());
  if(!box.hidden){const r=visibleBounds(entry);box.hidden=r.width<=0||r.height<=0||!entry.component.isVisible();Object.assign(box.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'});}
  $('#selection-hint').textContent=mode==='interact'?'Interact mode · Test actions and drag to scroll. Choose Select to inspect JSON.':!same?'Preview is out of date · Compile the draft before selecting on the canvas.':mappingError||'Select mode · Click a component to see its JSON. Use Interact to scroll or test actions.';
 }
 function animate(){updateBox();if(mode==='select')frame=requestAnimationFrame(animate);}
 function setMode(next){mode=next;for(const value of ['select','interact'])$('#mode-'+value).setAttribute('aria-pressed',String(mode===value));$('#phone').style.cursor=mode==='select'?'crosshair':'';cancelAnimationFrame(frame);animate();}
 $('#mode-select').onclick=()=>setMode('select');$('#mode-interact').onclick=()=>setMode('interact');
 $('#phone').addEventListener('pointerdown',event=>{
  if(mode!=='select')return;
  event.preventDefault();event.stopImmediatePropagation();
  if(!guard())return;
  if(getSource()!==mappingSource){message('Preview the draft before selecting. The canvas still displays the previous document.',true);return;}
  if(mappingError){message(mappingError,true);return;}
  const canvas=$('#phone canvas'),rect=canvas.getBoundingClientRect();
  const hit=hitLayout(entries,(event.clientX-rect.left)*canvas.width/rect.width,(event.clientY-rect.top)*canvas.height/rect.height);
  if(hit)choose(hit.path);else message('No visible layout component here. Choose a layer to inspect nonvisual primitives.');
 },true);
 input.oninput=()=>{highlight(input,$('#component-highlight'));notice();persist();};input.onscroll=()=>highlight(input,$('#component-highlight'));
 $('#component-discard').onclick=()=>{input.value=original;persist();sync();};
 $('#component-parent').onclick=()=>{if(!guard())return;const parents=entries.filter(e=>e.path.length<path.length&&e.path.every((v,i)=>path[i]===v));const parent=parents.at(-1);if(parent)choose(parent.path);else showTab('document');};
 $('#component-apply').onclick=async()=>{
  if(busyState)return;
  try{
   if(base!==getSource())throw Error('The document changed since this component was opened. Copy your edits before discarding; newer document changes were preserved.');
   const node=JSON.parse(input.value);if(!node||typeof node!=='object'||Array.isArray(node))throw Error('A component must be a primitive JSON object.');
   const doc=getDocument(),parent=atPath(doc,path.slice(0,-1));parent[path.at(-1)]=node;
   original=input.value;save(doc);persist();sync();await compile();
  }catch(error){message(String(error),true);}
 };
 $('#component-document').onclick=()=>{
  if(!guard())return;
  // Locate the path in JSON text without reformatting or modifying the authoritative source.
  const range=jsonRange(getSource(),path);showTab('document');const source=$('#source');source.focus();
  if(range){source.setSelectionRange(range.start,range.end);source.scrollTop=Math.max(0,(getSource().slice(0,range.start).split('\n').length-3)*17);highlight();}
 };
 return {sync,guard,pending,resetPath(){path=null;},sourceChanged(){notice();updateBox();},setBusy(busy){busyState=busy;$('#component-apply').disabled=busy||!path;},attach(doc,decoded,source){mappingSource=source;try{entries=mapLayouts(doc,decoded);mappingError='';}catch(e){entries=[];mappingError=String(e.message);}const box=document.createElement('div');box.id='selection-box';box.hidden=true;box.setAttribute('aria-hidden','true');$('#phone').append(box);sync();updateBox();},selectSection(){if(!guard())return false;path=null;return true;}};
}

// A small JSON token walker used only to find an already-parsed subtree's source range.
// Strings can contain escaped braces, commas and quotes; formatting is never regenerated.
export function jsonRange(text,wanted){
 let i=0,result=null;const space=()=>{while(/\s/.test(text[i]||'')&&i<text.length)i++;};
 function string(){const start=i++;while(i<text.length){if(text[i]==='\\'){i+=2;continue;}if(text[i++]==='"')break;}return JSON.parse(text.slice(start,i));}
 function value(path){space();const start=i,c=text[i];if(c==='{'){i++;space();while(text[i]!=='}'){const key=string();space();i++;value([...path,key]);space();if(text[i]!==',')break;i++;space();}i++;}else if(c==='['){i++;space();let n=0;while(text[i]!==']'){value([...path,n++]);space();if(text[i]!==',')break;i++;}i++;}else if(c==='"')string();else{while(i<text.length&&!/[\s,}\]]/.test(text[i]))i++;}if(JSON.stringify(path)===JSON.stringify(wanted))result={start,end:i};}
 JSON.parse(text);value([]);return result;
}
