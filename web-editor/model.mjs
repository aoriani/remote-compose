// Authoring templates only: their output is upstream primitive JSON, never client widgets.
export const colors={paper:'#F5F4EF',ink:'#182C38',muted:'#616D77',blue:'#305BEF',navy:'#203B73',line:'#E3E6E6',white:'#FFFFFF',sage:'#E6ECDD',peach:'#F7E4D6'};
export const text=(value,fontSize=20,color=colors.ink)=>({type:'text',value,fontSize,color});
const column=(children,modifiers=[])=>({type:'column',modifiers,children});
const row=(children,modifiers=[])=>({type:'row',modifiers,children});
const paint=(color,size)=>({type:'paint',ops:[{shader:0},{style:'fill'},{color},...(size?[{textSize:size}]:[])]});
const rect=(x,y,w,h,r=0)=>r?{type:'drawRoundRect',left:x,top:y,right:x+w,bottom:y+h,rx:r,ry:r}:{type:'drawRect',left:x,top:y,right:x+w,bottom:y+h};
const circle=(x,y,r)=>({type:'drawCircle',cx:x,cy:y,radius:r});
const label=(value,x,y,size=14,color=colors.ink)=>[paint(color,size),{type:'drawTextAnchored',text:value,x,y,panX:-1,panY:0}];
const line=(x1,y1,x2,y2,color=colors.ink,width=1.7)=>[{type:'paint',ops:[{shader:0},{color},{style:'stroke'},{strokeWidth:width},{strokeCap:'round'}]},{type:'drawLine',x1,y1,x2,y2}];
const photo=(name,left,top,right,bottom)=>[{type:'addBitmap',image:name,varName:`photo_${name.replaceAll('-','_')}`},{type:'drawBitmap',image:`@photo_${name.replaceAll('-','_')}`,left,top,right,bottom}];
// Full-width sections anchor their trailing geometry to the actual protocol viewport.
// This changes authoring templates only; existing/custom JSON is never regenerated.
const trailing=x=>`windowWidth() - ${390-x}`;
function fluidCommands(commands){return commands.map(command=>{
 const c=structuredClone(command);
 if(c.type==='drawBitmap'&&typeof c.right==='number'&&c.right>300){c.left=trailing(c.left);c.right=trailing(c.right);return c;}
 if(['drawRect','drawRoundRect'].includes(c.type)&&typeof c.right==='number'&&c.right>=350)c.right=trailing(c.right);
 for(const key of ['cx','x','x1','x2'])if(typeof c[key]==='number'&&c[key]>=300)c[key]=trailing(c[key]);
 return c;
});}
const canvas=(height,commands,extra=[])=>({type:'canvas',modifiers:[{fillMaxWidth:1},{height},...extra],commands:fluidCommands(commands)});
const header=()=>canvas(80,[paint(colors.ink),circle(34,34,15),...line(28,34,40,34,'#FFFFFF',2),...line(34,28,34,40,'#FFFFFF',2),...label('common',58,28,23),...label('MARKET',59,49,10,colors.muted),paint('#FFFFFF'),circle(337,34,19),...line(331,32,340,41,colors.ink,1.5),{type:'paint',ops:[{color:colors.ink},{style:'stroke'},{strokeWidth:1.5}]},circle(332,31,5),...label('YOUR MEMBERSHIP, MADE MORE.',20,72,9,colors.muted)]);
const hero=()=>canvas(232,[paint('#203B73'),rect(20,4,350,216,22),...photo('market-harvest','windowWidth() - 22 - min(157, windowWidth() - 232)','215 - min(157, windowWidth() - 232)','windowWidth() - 22',215),...label('THE EVERYDAY, UPGRADED',40,30,9,'#BDCEF9'),...label('Good things.',40,69,28,'#FFFFFF'),...label('Less waiting.',40,103,28,'#FFFFFF'),...label('Your next club run,',40,139,13,'#C5D5F4'),...label('on your own terms.',40,157,13,'#C5D5F4'),paint('#FFFFFF'),rect(40,175,163,38,19),...label('Open Scan & Go',55,194,12,colors.navy),...line(179,191,185,194,colors.navy,1.4),...line(179,197,185,194,colors.navy,1.4)],[{onClick:{type:'HostAction',actionId:42}}]);
const button=()=>canvas(72,[paint(colors.blue),rect(20,8,350,52,16),...label('Start scanning',44,34,16,'#FFFFFF'),...line(332,30,338,34,'#FFFFFF'),...line(332,38,338,34,'#FFFFFF')],[{onClick:{type:'HostAction',actionId:42}}]);
const promo=()=>canvas(76,[paint(colors.peach),rect(20,4,350,62,16),...label('A little extra, just for you.',39,28,15),...label('Members save 20% on pantry favorites.',39,48,11,'#875E46'),...label('20%',315,37,18,'#985032')]);
const image=(name='oat-milk')=>canvas(200,[paint('#E9EDE1'),rect(20,4,350,188,20),...photo(name,101,0,289,188)]);
function product(name,brand,title,detail,price,bg){return {type:'canvas',modifiers:[{width:180},{height:270},{onClick:{type:'HostAction',actionId:201+['oat-milk','citrus-soda','granola'].indexOf(name)}}],commands:[paint('#FFFFFF'),rect(8,2,164,258,16),paint(bg),rect(8,2,164,153,16),...photo(name,24,11,156,143),...label(brand,20,171,9,colors.muted),...label(title,20,191,14),...label(detail,20,212,10,colors.muted),...label(price,20,241,21),paint('#EAF0FF'),circle(149,239,13),...line(144,239,154,239,colors.blue),...line(149,234,149,244,colors.blue),paint('#FFFFFF'),circle(145,24,13),{type:'paint',ops:[{color:colors.muted},{style:'stroke'},{strokeWidth:1.3}]},{type:'drawPath',path:'M 145 31 C 144 30 136 25 136 21 C 136 16 142 15 145 19 C 148 15 154 16 154 21 C 154 25 146 30 145 31 Z'}]};}
const products=()=>row([product('oat-milk','FIELD / OAT','Barista oat drink','1 L · Plant based','$3.49','#E8EDDD'),product('citrus-soda','SOL','Sparkling citrus','330 mL · Real fruit','$1.99','#F9E5D4'),product('granola','MORN','Maple granola','350 g · Small batch','$6.50','#EEE7F5')],[{fillMaxWidth:1},{height:274},{padding:[12,0,12,0]},{horizontalScroll:0}]);
const news=()=>row([canvas(182,[paint('#DCE7DE'),rect(8,0,250,170,20),...photo('granola',142,26,254,138),...label('THE SLOW',27,34,10,'#4E6654'),...label('MORNING EDIT',27,50,10,'#4E6654'),...label('Make room',27,91,22),...label('for better.',27,117,22),...label('Discover more  →',27,149,11)],[]),canvas(182,[paint('#F2E1D0'),rect(8,0,250,170,20),...photo('citrus-soda',148,31,255,138),...label('BRIGHTER DAYS',27,35,10,'#805635'),...label('A fresh take',27,88,22),...label('on the usual.',27,114,22),...label('Explore the edit  →',27,149,11)])].map(c=>({...c,modifiers:[{width:266},{height:182}]})),[{fillMaxWidth:1},{height:182},{padding:[12,0,12,0]},{horizontalScroll:0}]);
const badge=()=>canvas(94,[paint('#E8EDDD'),rect(20,8,350,74,18),paint('#305BEF'),circle(48,48,'4 + 1.2 * sin(time * 3)'),...label('Good to be a member.',64,36,15),...label('A fresh little perk, every week.',64,58,11,colors.muted),...line(332,52,343,41,colors.ink),...line(336,41,343,41,colors.ink),...line(343,41,343,48,colors.ink)]);
const progress=()=>canvas(104,[...label('A little closer to your next reward',24,23,14),...label('Your membership keeps giving.',24,45,11,colors.muted),paint('#E0E5DC'),rect(20,67,350,5,2.5),paint(colors.blue),{type:'drawRect',left:20,top:67,right:'20 + (windowWidth() - 40) * (185 + 24 * sin(time * 2)) / 350',bottom:72},...label('MEMBER MILESTONES',24,91,9,colors.muted)]);
const definitions={
 header:['Brand header',header,[['Brand name',['commands',7,'text']]]],
 text:['Editorial heading',()=>({...text('Picked for your everyday',24),fontWeight:650,modifiers:[{padding:[20,12,20,12]}]}),[['Text',['value']],['Font size',['fontSize'],'number'],['Color',['color']]]],
 spacer:['Spacer',()=>({type:'spacer',modifiers:[{height:16}]}),[['Height',['modifiers',0,'height'],'number']]],
 hero:['Scan & Go hero',hero,[['Headline',['commands',7,'text']],['Supporting line',['commands',11,'text']],['Hero illustration',['commands',2,'image'],'asset']]],
 promo:['Member offer',promo,[['Message',['commands',3,'text']]]],
 image:['Product spotlight',image,[['Image size',['commands',3,'right'],'number',{kind:'image-size',left:['commands',3,'left'],top:['commands',3,'top'],bottom:['commands',3,'bottom'],min:16,max:188}],['Illustration',['commands',2,'image'],'asset']]],
 button:['Scan action',button,[['Label',['commands',3,'text']],['Host event ID',['modifiers',2,'onClick','actionId'],'number']]],
 products:['Product collection',products,[['First product',['children',0,'commands',9,'text']],['First price',['children',0,'commands',13,'text']],['First illustration',['children',0,'commands',4,'image'],'asset']]],
 news:['Editorial stories',news,[['First story',['children',0,'commands',9,'text']],['First illustration',['children',0,'commands',2,'image'],'asset']]],
 badge:['Member perk · pulse',badge,[['Pulse expression',['commands',3,'radius']]]],
 progress:['Reward progress · animated',progress,[['Progress expression',['commands',7,'right']]]],
};
export const catalog = Object.entries(definitions).map(([id,[label]])=>({id,label}));
export function createWidget(id) { if(!definitions[id]) throw Error('Unknown authoring template'); return definitions[id][1](); }
const clone = value => structuredClone(value);
function at(node,path) { return path.reduce((n,k)=>n?.[k],node); }
export function patch(node,path,value) { let cursor=node; for(const k of path.slice(0,-1)) cursor=cursor[k]; cursor[path.at(-1)]=value; }
function canonical(value) { if(Array.isArray(value))return value.map(canonical); if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])); return value; }
function signature(node,fields) { const copy=clone(node);for(const [,path,,options] of fields){patch(copy,path,null);if(options?.kind==='image-size')for(const key of ['left','top','bottom'])patch(copy,options[key],null);}return JSON.stringify(canonical(copy)); }
export function recognize(node) {
  for(const [id,[label,factory,fields]] of Object.entries(definitions)) {
    try { if(signature(node,fields)===signature(factory(),fields)) return {id,label,fields:fields.map(([label,path,type,options])=>({label,path,type:type||'text',options,value:options?.kind==='image-size'?at(node,path)-at(node,options.left):at(node,path)}))}; } catch {}
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
export function initialDocument(){return {header:{width:390,height:844,profiles:512,fps:60},root:column([header(),canvas(60,[...label('Hello, Alex',20,16,12,colors.muted),...label('A good day starts here.',20,45,26)]),hero(),canvas(58,[paint(colors.blue),rect(20,8,74,30,15),...label('For you',36,23,12,'#FFFFFF'),...label('Fresh',119,23,12,colors.muted),...label('Pantry',199,23,12,colors.muted),...label('Home',287,23,12,colors.muted)]),promo(),{...text('The good stuff',25),fontWeight:650,modifiers:[{padding:[20,16,20,12]}]},products(),badge(),{...text('A little inspiration',25),fontWeight:650,modifiers:[{padding:[20,16,20,16]}]},news(),progress(),{type:'spacer',modifiers:[{height:24}]}],[{fillMaxSize:1},{background:colors.paper},{verticalScroll:0}])};}

/** Image slots work for custom primitive trees too; no template regeneration. */
export function assetSlots(node,path=[]){if(!node||typeof node!=='object')return [];let result=[];if(node.type?.toLowerCase()==='addbitmap'&&typeof node.image==='string')result.push({path:[...path,'image'],value:node.image});if(node.addBitmap?.image)result.push({path:[...path,'addBitmap','image'],value:node.addBitmap.image});for(const [key,value] of Object.entries(node))if(value&&typeof value==='object')result.push(...assetSlots(value,[...path,Array.isArray(node)?Number(key):key]));return result;}

export function updateField(node,field,value){
 if(field.options?.kind==='image-size'){
  const o=field.options;if(value<o.min||value>o.max)throw Error(`Image size must be ${o.min}–${o.max}px inside this art frame. Resize the frame in JSON for larger artwork.`);
  const left=at(node,o.left),right=at(node,field.path),top=at(node,o.top),bottom=at(node,o.bottom),cx=(left+right)/2,cy=(top+bottom)/2,height=value*(bottom-top)/(right-left);
  patch(node,o.left,cx-value/2);patch(node,field.path,cx+value/2);patch(node,o.top,cy-height/2);patch(node,o.bottom,cy+height/2);
 }else patch(node,field.path,value);
}
