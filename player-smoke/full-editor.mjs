import{chromium}from'playwright';
import assert from'node:assert/strict';
import{writeFile,mkdir,readFile}from'node:fs/promises';
import{resolve}from'node:path';
import{createHash}from'node:crypto';
import{catalog,recognize,sections,patch,createWidget}from'../web-editor/model.mjs';
import{fixtures,document as doc,canvas,paint,title}from'../scripts/generate-validation.mjs';
export async function runEditor(base,folder){
 await mkdir(folder,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1500,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/unknown (operation|opcode|tag)/i.test(m.text()))errors.push(m.text());});
 let compilePosts=0;page.on('request',r=>{if(r.url().endsWith('/api/compile')&&r.method()==='POST')compilePosts++;});
 const read=async()=>JSON.parse(await page.locator('#source').inputValue());
 const apply=async source=>{await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify(source));await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);assert.ok(!(await page.locator('#status').textContent()).includes('"errors"'),await page.locator('#status').textContent());};
 const frame=async name=>{await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const png=await page.locator('#phone canvas').evaluate(c=>c.toDataURL('image/png'));await writeFile(resolve(folder,name+'.png'),Buffer.from(png.split(',')[1],'base64'));};
 const published=[],properties=[],coverage={};
 async function publish(id,source,plan={}){
  await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify(source));
  const old=await page.evaluate(()=>window.rcProof.published?.version||0);await page.locator('#publish').click();await page.waitForFunction(v=>window.rcProof.published?.version>v,old);
  const meta=await page.evaluate(()=>window.rcProof.published);const response=await fetch(`${base}/api/documents/${meta.version}`),bytes=Buffer.from(await response.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.sha256);
  await writeFile(resolve(folder,id+'.rc'),bytes);await writeFile(resolve(folder,id+'.json'),JSON.stringify(source,null,2)+'\n');
  const before=compilePosts;await page.locator('#load-published').click();await page.waitForFunction(v=>window.rcProof.loadedVersion===v,meta.version);assert.equal(compilePosts,before,'Loading published must not recompile');assert.equal(await page.evaluate(()=>window.rcProof.sha256),meta.sha256);
  await frame(id+'--before');if(plan.live){await page.waitForTimeout(550);await frame(id+'--live');}const eventsBefore=await page.evaluate(()=>window.rcProof.events.length);
  if(plan.actions){for(const action of plan.actions){const c=await page.locator('#phone canvas').boundingBox();await page.mouse.click(c.x+action.x*c.width/390,c.y+action.y*c.height/844);}
   await page.waitForFunction(()=>window.rcProof.events.some(e=>e.id===501));await frame(id+'--after');const events=await page.evaluate(()=>window.rcProof.events);coverage.interactionEvents=events.slice(eventsBefore);assert.ok(events.some(e=>e.name==='validation.echo'&&e.value==='hello-protocol'));}
  if(plan.scroll){const c=await page.locator('#phone canvas').boundingBox();await page.mouse.move(c.x+c.width*.85,c.y+c.height*.85);await page.mouse.down();await page.mouse.move(c.x+c.width*.85,c.y+c.height*.25,{steps:25});await page.mouse.up();await frame(id+'--scroll');}
  published.push({id,version:meta.version,sha256:meta.sha256,bytes:meta.bytes,plan});
 }
 try{
  await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready||window.rcProof?.lastError);assert.equal(await page.evaluate(()=>window.rcProof.lastError),undefined);
  const custom={type:'canvas',modifiers:[{height:32}],commands:[paint('#73808A'),{type:'drawCircle',cx:20,cy:16,radius:6}]};
  for(const {id}of catalog){
   await apply(doc('property-'+id,{type:'column',modifiers:[{fillMaxSize:1},{background:'#FFFFFF'}],children:[custom]}));
   await page.locator(`[data-template="${id}"]`).click();await page.locator('#properties-tab').click();
   const fields=recognize(sections(await read())[1]).fields;
   for(let index=0;index<fields.length;index++){
    const before=await read(),node=sections(before)[1],field=recognize(node).fields[index],input=page.locator('#properties label').nth(index).locator('input,select');
    let value;if(field.type==='asset'){const options=await input.locator('option').evaluateAll(n=>n.map(x=>x.value));value=options.find(x=>x!==field.value);await input.selectOption(value);}
    else{value=field.type==='number'?(field.options?.kind==='image-size'?160:field.options?.kind==='carousel-count'?4:field.label.startsWith('Slide duration')?.3:field.label.startsWith('Show ')?1-Number(field.value):Number(field.value)+2):field.label.includes('expression')?field.value+' + 0.25':/color/i.test(field.label)?'#305BEF':field.label.toLowerCase().includes('price')?'$4.75':field.label.includes('identifier')?'validation.action'+index:'Fresh finds.';await input.fill(String(value));await input.press('Tab');}
    const after=await read(),expected=structuredClone(before),target=sections(expected)[1];
    if(field.options?.kind==='image-size'){const b=target.commands[3],cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2,h=value*(b.bottom-b.top)/(b.right-b.left);b.left=cx-value/2;b.right=cx+value/2;b.top=cy-h/2;b.bottom=cy+h/2;}else if(field.options?.kind!=='carousel-count')patch(target,field.path,value);
    if(field.options?.kind==='carousel-count'){assert.equal(sections(after)[1].children[14].value,4);assert.deepEqual(sections(after)[0],sections(before)[0]);assert.deepEqual(sections(after)[1].children.slice(0,14),node.children.slice(0,14));}
    else assert.deepEqual(after,expected,`${id}/${field.label}: unrelated JSON changed`);await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);assert.match(await page.locator('#status').textContent(),/Valid document/);properties.push({widget:id,field:field.label,path:field.path,value,passed:true});
    if(field.options?.kind==='carousel-count'){await input.fill(String(field.value));await input.press('Tab');assert.deepEqual(await read(),before,'Restoring slide count must retain every earlier customization');}
   }
   const edited=await read();await page.locator('[data-op="up"]').click();await page.locator('[data-op="down"]').click();await page.locator('[data-op="duplicate"]').click();if(['carousel','products'].includes(id))assert.match(await page.locator('#status').textContent(),/declares IDs or variables/);else await page.locator('[data-op="delete"]').click();assert.deepEqual(await read(),edited);assert.deepEqual(sections(await read())[0],custom);
   await page.locator('[data-op="delete"]').click();assert.deepEqual(sections(await read()),[custom],`${id}: deleting selected widget must retain the custom section`);(coverage.deletedTemplates??=[]).push(id);
   const node=structuredClone(sections(edited)[1]);const freeze=n=>{if(n&&typeof n==='object')for(const[k,v]of Object.entries(n))if(typeof v==='string'&&v.includes('time'))n[k]=v.replaceAll('time','@phase');else if(v&&typeof v==='object')freeze(v);};freeze(node);
   await publish('widget-'+id,doc('widget-'+id,{type:'column',modifiers:[{fillMaxSize:1},{background:'#FFFFFF'}],children:[canvas(title(id),[{height:50},{fillMaxWidth:1}]),node,canvas([paint('#00827E'),{type:'drawRect',left:20,top:0,right:370,bottom:3}],[{height:4},{fillMaxWidth:1}])]}, {variables:{phase:.25}}),{widget:id,rois:[]});
  }
  for(const c of fixtures()){await apply(c.source);await publish(c.id,c.source,c.plan);}
  // Empty/repopulation, large document, raw-source preservation and rapid changes.
  const large=doc('large',{type:'column',modifiers:[{fillMaxSize:1},{verticalScroll:0}],children:Array.from({length:160},(_,i)=>({type:'text',value:'Long document section '+i,fontSize:18}))});await apply(large);coverage.largeSections=160;
  await page.locator('#source').fill('{');await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);assert.match(await page.locator('#status').textContent(),/MALFORMED_JSON/);
  const version=(await(await fetch(base+'/api/documents/latest/metadata')).json()).version;
  for(const source of ['{"root":{"type":"unsupported-widget"}}','{"root":{"type":"text","value":false}}']){await page.locator('#source').fill(source);await page.locator('#publish').click();await page.waitForFunction(()=>!document.querySelector('#publish').disabled);assert.equal((await(await fetch(base+'/api/documents/latest/metadata')).json()).version,version);}
  coverage.undoRedo='Not implemented; no undo/redo controls';coverage.errors=errors;assert.deepEqual(errors,[]);
  await writeFile(resolve(folder,'editor-results.json'),JSON.stringify({properties,coverage,cases:published},null,2)+'\n');return published;
 }catch(error){await page.screenshot({path:resolve(folder,'editor-failure.png'),fullPage:true});await writeFile(resolve(folder,'editor-failure.json'),JSON.stringify({error:String(error),status:await page.locator('#status').textContent(),properties,errors},null,2));throw error;}finally{await browser.close();}
}
