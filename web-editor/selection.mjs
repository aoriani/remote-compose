// Editor-only bridge between primitive source and the pinned player's measured layouts.
// No IDs, metadata or operations are inserted into the published document.
const codes={box:202,row:203,column:204,canvas:205,text:208,spacer:202};
const layoutCodes=new Set([...Object.values(codes),239]);
export const atPath=(value,path)=>path.reduce((node,key)=>node?.[key],value);
export const pathLabel=path=>path.map((key,i)=>typeof key==='number'?`[${key}]`:(i?'.':'')+key).join('');
export function sectionPaths(doc){
 if(doc.root?.type?.toLowerCase()==='column'&&Array.isArray(doc.root.children))return doc.root.children.map((_,i)=>['root','children',i]);
 if(Array.isArray(doc.root?.column?.children))return doc.root.column.children.map((_,i)=>['root','column','children',i]);
 return Array.isArray(doc.root)?doc.root.map((_,i)=>['root',i]):doc.root?[['root']]:[];
}
export function normalized(node){
 if(node?.type)return {type:node.type.toLowerCase(),body:node,bodyPath:[]};
 const key=Object.keys(node||{})[0];return {type:key?.toLowerCase(),body:node?.[key],bodyPath:[key]};
}
function sourceTree(node,path){
 const {type,body,bodyPath}=normalized(node);
 if(type==='variable')return null;
 if(!codes[type])throw Error(`Canvas selection is unavailable for ${pathLabel(path)}. Use Layers or document JSON.`);
 return {path,node,type,children:(body.children||[]).map((child,i)=>sourceTree(child,[...path,...bodyPath,'children',i])).filter(Boolean)};
}
function layoutChildren(component){
 return (component.mChildrenComponents||component.getList()).filter(op=>layoutCodes.has(op.constructor.OP_CODE));
}
export function mapLayouts(doc,decoded){
 const root=decoded.getRootLayoutComponent?.();if(!root)throw Error('This document has no inspectable layout tree. Use Layers.');
 const sources=Array.isArray(doc.root)?doc.root.map((n,i)=>sourceTree(n,['root',i])).filter(Boolean):[sourceTree(doc.root,['root'])].filter(Boolean);
 const entries=[];
 function pair(sources,components,parent){
  if(sources.length!==components.length)throw Error('Source and player layout trees differ. Canvas selection is unavailable; use Layers.');
  sources.forEach((source,i)=>{
   const component=components[i];if(component.constructor.OP_CODE!==codes[source.type]&&!(source.type==='text'&&component.constructor.OP_CODE===239))throw Error(`Cannot safely map ${pathLabel(source.path)} to the player. Use Layers.`);
   const entry={...source,component,parent,children:[]};entries.push(entry);if(parent)parent.children.push(entry);
   pair(source.children,layoutChildren(component),entry);
  });
 }
 pair(sources,layoutChildren(root),null);
 return entries;
}
export function bounds(entry){
 const c=entry.component,[x,y]=c.getLocationInWindow();
 // LayoutComponent reports its padded content origin. Outline the actual outer box.
 return {x:x-(c.mPaddingLeft||0),y:y-(c.mPaddingTop||0),width:c.getWidth(),height:c.getHeight()};
}
function inside(r,x,y){return r.width>0&&r.height>0&&x>=r.x&&x<=r.x+r.width&&y>=r.y&&y<=r.y+r.height;}
function clipped(entry,x,y){
 for(let e=entry;e;e=e.parent){
  if(!e.component.isVisible())return true;
  const mods=normalized(e.node).body.modifiers||[];
  for(const m of mods){
   const key=Object.keys(m)[0]?.toLowerCase();if(!['clip','verticalscroll','horizontalscroll'].includes(key))continue;
   const r=bounds(e);if(!inside(r,x,y))return true;
   const value=Object.values(m)[0];
   if(key==='clip'&&value.type?.toLowerCase()==='roundrect'){
    const radius=Math.max(0,Math.min(value.radius||0,r.width/2,r.height/2));
    const cx=Math.max(r.x+radius,Math.min(x,r.x+r.width-radius)),cy=Math.max(r.y+radius,Math.min(y,r.y+r.height-radius));
    if((x-cx)**2+(y-cy)**2>radius**2)return true;
   }
  }
 }
 return false;
}
export function hitLayout(entries,x,y){
 function visit(nodes){
  const order=[...nodes].sort((a,b)=>a.component.getZIndex()-b.component.getZIndex());
  for(const e of order.reverse()){
   if(clipped(e,x,y))continue;
   const child=visit(e.children);if(child)return child;
   if(inside(bounds(e),x,y))return e;
  }
  return null;
 }
 return visit(entries.filter(e=>!e.parent));
}

export function visibleBounds(entry,width=390,height=844){
 const r=bounds(entry);let left=Math.max(0,r.x),top=Math.max(0,r.y),right=Math.min(width,r.x+r.width),bottom=Math.min(height,r.y+r.height);
 for(let e=entry.parent;e;e=e.parent){
  if(!e.component.isVisible())return {x:0,y:0,width:0,height:0};
  if((normalized(e.node).body.modifiers||[]).some(m=>['clip','verticalscroll','horizontalscroll'].includes(Object.keys(m)[0]?.toLowerCase()))){const b=bounds(e);left=Math.max(left,b.x);top=Math.max(top,b.y);right=Math.min(right,b.x+b.width);bottom=Math.min(bottom,b.y+b.height);}
 }
 return {x:left,y:top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
}
