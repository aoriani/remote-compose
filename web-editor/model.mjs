// Only authoring templates. The returned upstream primitive tree is the complete UI.
export const text = (value, fontSize = 20, color = '#123047') => ({type:'text',value,fontSize,color});
const box = (children, modifiers=[]) => ({type:'box',modifiers,children});
const column = (children, modifiers=[]) => ({type:'column',modifiers,children});
const row = (children, modifiers=[]) => ({type:'row',modifiers,children});
const canvas = (height, commands) => ({type:'canvas',modifiers:[{fillMaxWidth:1},{height}],commands});
const paint = color => ({type:'paint',ops:[{color},{style:'fill'}]});
const button = () => ({...box([text('Start scanning',20,'#FFFFFF')],[{fillMaxWidth:1},{height:56},{background:'#0067A0'},{onClick:{type:'HostAction',actionId:42}}]),horizontalAlignment:'center',verticalAlignment:'center'});
const image = () => canvas(120,[{type:'addBitmap',image:'club-bag',varName:'bagImage'},{type:'drawBitmap',image:'@bagImage',left:0,top:0,right:160,bottom:120}]);
const definitions = {
  header: ['Header',()=>box([text('Scan & Go',28,'#FFFFFF')],[{fillMaxWidth:1},{background:'#0067A0'},{padding:20}]),[['Title',['children',0,'value']]]],
  text: ['Text',()=>text('Discover more for less',22),[['Text',['value']],['Font size',['fontSize'],'number'],['Color',['color']]]],
  spacer: ['Spacer',()=>({type:'spacer',modifiers:[{height:16}]}),[['Height',['modifiers',0,'height'],'number']]],
  hero: ['Hero banner',()=>column([text('Your club. Your way.',30),text('Scan, pay, and go. Skip the checkout line.',18)],[{fillMaxWidth:1},{background:'#DDF3F7'},{padding:24}]),[['Title',['children',0,'value']],['Subtitle',['children',1,'value']]]],
  promo: ['Promotional banner',()=>box([text('Member savings • This week only',20)],[{fillMaxWidth:1},{background:'#FFF0C4'},{padding:18}]),[['Message',['children',0,'value']]]],
  image: ['Image',image,[['Rendered width',['commands',1,'right'],'number']]],
  button: ['Button',button,[['Label',['children',0,'value']],['Host event ID',['modifiers',3,'onClick','actionId'],'number']]],
  products: ['Product carousel',()=>row([column([image(),text('Fresh finds',18),text('$12.98',22)],[{width:180},{padding:8}]),column([image(),text('Club favorites',18),text('$18.98',22)],[{width:180},{padding:8}]),column([image(),text('Pantry essentials',18),text('$8.98',22)],[{width:180},{padding:8}])],[{fillMaxWidth:1},{height:212},{horizontalScroll:0}]),[['First product',['children',0,'children',1,'value']],['First price',['children',0,'children',2,'value']]]],
  news: ['Content carousel',()=>row([box([text('Tips for your next club trip',20)],[{width:240},{height:100},{background:'#E7EFFA'},{padding:18}]),box([text('Explore member benefits',20)],[{width:240},{height:100},{background:'#DDF3E9'},{padding:18}])],[{fillMaxWidth:1},{height:110},{horizontalScroll:0}]),[['First story',['children',0,'children',0,'value']]]],
  badge: ['Pulsing promotional badge',()=>canvas(100,[paint('#E94069'),{type:'drawCircle',cx:48,cy:48,radius:'24 + 8 * sin(time * 3)'},paint('#123047'),{type:'drawTextAnchored',text:'MEMBER DEAL',x:100,y:48,panX:-1,panY:0}]),[['Pulse expression',['commands',1,'radius']]]],
  progress: ['Animated progress indicator',()=>canvas(64,[paint('#DDE6EC'),{type:'drawRect',left:20,top:20,right:360,bottom:36},paint('#007C83'),{type:'drawRect',left:20,top:20,right:'20 + 165 * (1 + sin(time * 2))',bottom:36}]),[['Progress expression',['commands',3,'right']]]],
};
export const catalog = Object.entries(definitions).map(([id,[label]])=>({id,label}));
export function createWidget(id) { if(!definitions[id]) throw Error('Unknown authoring template'); return definitions[id][1](); }
const clone = value => structuredClone(value);
function at(node,path) { return path.reduce((n,k)=>n?.[k],node); }
export function patch(node,path,value) { let cursor=node; for(const k of path.slice(0,-1)) cursor=cursor[k]; cursor[path.at(-1)]=value; }
function canonical(value) { if(Array.isArray(value))return value.map(canonical); if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])); return value; }
function signature(node,fields) { const copy=clone(node);for(const [,path] of fields)patch(copy,path,null);return JSON.stringify(canonical(copy)); }
export function recognize(node) {
  for(const [id,[label,factory,fields]] of Object.entries(definitions)) {
    try { if(signature(node,fields)===signature(factory(),fields)) return {id,label,fields:fields.map(([label,path,type])=>({label,path,type:type||'text',value:at(node,path)}))}; } catch {}
  }
  return {id:null,label:'Custom composition',fields:[]};
}
function columnBody(doc) { return doc.root?.type?.toLowerCase()==='column' ? doc.root : doc.root?.column; }
export function sections(doc) { const c=columnBody(doc);return c&&Array.isArray(c.children)?c.children:Array.isArray(doc.root)?doc.root:[doc.root]; }
export function setSections(doc,list) { const c=columnBody(doc);if(c&&Array.isArray(c.children))c.children=list;else if(Array.isArray(doc.root))doc.root=list;else doc.root=list.length===1?list[0]:column(list,[{fillMaxWidth:1}]); }
function hasDeclarations(node) { if(!node||typeof node!=='object')return false; if(node.type?.toLowerCase()==='variable'||node.type?.toLowerCase()==='definepattern'||Object.hasOwn(node,'variable')||Object.hasOwn(node,'id'))return true;return Object.values(node).some(v=>Array.isArray(v)?v.some(hasDeclarations):hasDeclarations(v)); }
export function operate(doc,index,operation) {
  const list=sections(doc).slice();if(index<0||index>=list.length)throw Error('Select a section first');
  if(operation==='delete')list.splice(index,1);
  if(operation==='duplicate') { if(hasDeclarations(list[index]))throw Error('This section declares IDs or variables. Duplicate in JSON with explicit ID remapping.');list.splice(index+1,0,clone(list[index]));setSections(doc,list);return index+1; }
  const to=operation==='up'?index-1:operation==='down'?index+1:index;
  if(to>=0&&to<list.length&&to!==index)[list[index],list[to]]=[list[to],list[index]];
  setSections(doc,list);return Math.min(Math.max(to,0),list.length-1);
}
export function initialDocument() { return {header:{width:390,height:844,profiles:512,fps:60},root:column(['header','hero','spacer','promo','spacer','button','badge','progress','products','news'].map(createWidget),[{fillMaxSize:1},{background:'#FFFFFF'},{verticalScroll:0}])}; }
