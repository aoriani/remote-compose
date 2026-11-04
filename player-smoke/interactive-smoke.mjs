import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=process.env.RC_TEST_URL||'http://127.0.0.1:8092';
await mkdir('artifacts/interactive',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1100}});
const errors=[],records=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/unknown operation|unknown tag/i.test(m.text()))errors.push(m.text());});
try{
 await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready);
 const document=JSON.parse(await readFile('samples/interactive-retail.json','utf8'));
 const apply=async doc=>{await page.locator('#json-tab').click();await page.locator('#source').fill(typeof doc==='string'?doc:JSON.stringify(doc,null,2));await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);};
 const canvas=page.locator('#phone canvas');
 const tap=async(x,y)=>{const b=await canvas.boundingBox();await page.mouse.click(b.x+x*b.width/390,b.y+y*b.height/844);};
 const shot=async id=>canvas.screenshot({path:`artifacts/interactive/browser-${id}.png`});
 const action=async(x,y,name,value)=>{const n=await page.evaluate(()=>window.rcProof.events.length);await tap(x,y);await page.waitForFunction(n=>window.rcProof.events.length>n,n);const events=await page.evaluate(n=>window.rcProof.events.slice(n),n);assert.equal(events.length,1,'duplicate event');assert.equal(events[0].name,name);if(value!==undefined)assert.equal(events[0].value,value);return events[0];};
 await apply(document);assert.match(await page.locator('#status').textContent(),/Valid document/);
 await shot('initial');
 await action(345,286,'carousel.next',1);await page.waitForTimeout(600);await action(100,80,'promotion.open',1);await shot('next');
 await action(44,286,'carousel.previous',0);await page.waitForTimeout(600);await action(100,80,'promotion.open',0);
 await action(239,286,'carousel.select',2);await page.waitForTimeout(600);await action(100,80,'promotion.open',2);await shot('selected-last');
 // Manual navigation resets the5s interval. Early click must still report last slide.
 await page.waitForTimeout(1500);await action(100,80,'promotion.open',2);
 await page.waitForTimeout(3400);await action(100,80,'promotion.open',0);await shot('wrapped-auto');
 await action(48,594,'favorite.change',1);await action(48,594,'favorite.change',0);
 await action(164,392,'category.select','Breakfast');await action(268,392,'category.select','Pantry');
 await action(346,594,'cart.add',1);await action(346,594,'cart.add',2);await action(250,594,'cart.quantity',1);await shot('local-state');
 await action(70,470,'product.open','field-oat');await action(80,646,'scan.open','scan-and-go');await action(100,695,'membership.open','common-market');
 await page.screenshot({path:'artifacts/interactive/editor-interactions.png',fullPage:true});
 const events=await page.evaluate(()=>window.rcProof.events);
 const published=async(id,doc)=>{
  await apply(doc);assert.match(await page.locator('#status').textContent(),/Valid document/);
  const preview=await page.evaluate(()=>window.rcProof.sha256);
  await page.locator('#publish').click();await page.waitForFunction(()=>!document.querySelector('#publish').disabled);
  const meta=await page.evaluate(()=>window.rcProof.published);
  const bytes=Buffer.from(await(await fetch(base+`/api/documents/${meta.version}`)).arrayBuffer());
  assert.equal(createHash('sha256').update(bytes).digest('hex'),preview);
  assert.equal(meta.sha256,preview);await writeFile(`artifacts/interactive/${id}.rc`,bytes);await shot(id);records.push({id,...meta});return meta;
 };
 const first=await published('interactive-original',document);
 // Custom edits cover text, color, dimension, layout and graphics with no template factory.
 const edited=structuredClone(document);
 edited.root.children[0].children[15].commands[9].text='Fresh JSON. Same apps.';
 edited.root.children[1].children.splice(4,0,{type:'box',modifiers:[{fillMaxWidth:1},{height:48},{padding:[8,0,8,0]}],children:[{type:'row',modifiers:[{fillMaxWidth:1}],children:[{type:'text',value:'Authored entirely in raw JSON',fontSize:16,color:'#643E82'},{type:'canvas',modifiers:[{width:40},{height:44}],commands:[{type:'paint',ops:[{color:'#A7286D'}]},{type:'drawCircle',cx:20,cy:20,radius:13}]}]}]});
 await page.locator('#source').fill(JSON.stringify(edited));
 assert.equal((await(await fetch(base+'/api/documents/latest/metadata')).json()).sha256,first.sha256,'draft published prematurely');
 await apply(edited);const stable=await page.evaluate(()=>window.rcProof.sha256);
 // Switching modes, formatting and unrelated visual operations must preserve complete custom tree.
 for(let i=0;i<3;i++){await page.locator('#properties-tab').click();await page.locator('#json-tab').click();}
 await page.locator('#format').click();assert.deepEqual(JSON.parse(await page.locator('#source').inputValue()),edited);
 await page.locator('[data-template="text"]').click();await page.locator('#properties-tab').click();await page.locator('#properties input').first().fill('Unrelated section');await page.locator('#properties input').first().press('Tab');
 for(const op of ['up','down','duplicate','delete','delete'])await page.locator(`[data-op="${op}"]`).click();assert.deepEqual(JSON.parse(await page.locator('#source').inputValue()),edited);
 for(const [source,code] of [['{','MALFORMED_JSON'],['{"root":{"type":"notAnOperation"}}','UNSUPPORTED_OPERATION'],['{"root":{"type":"text","value":"Bad","fontSize":false}}','INVALID_PROPERTY']]){
  await apply(source);assert.ok((await page.locator('#status').textContent()).includes(code));assert.equal(await page.evaluate(()=>window.rcProof.sha256),stable);
  await page.locator('#publish').click();await page.waitForFunction(()=>!document.querySelector('#publish').disabled);assert.equal((await(await fetch(base+'/api/documents/latest/metadata')).json()).sha256,first.sha256);
 }
 await published('interactive-json-edited',edited);
 await published('interactive-final',document);
 await writeFile('artifacts/interactive/browser-proof.json',JSON.stringify({errors,events,records,rawLifecycle:{text:true,color:true,dimension:true,nestedLayouts:true,graphics:true,customPreserved:true,draftIsolation:true,failedPublishRetained:true,undoRedo:'not implemented'}},null,2));
 assert.deepEqual(errors,[]);console.log(JSON.stringify({events:events.length,records:records.map(x=>({version:x.version,sha256:x.sha256})),errors},null,2));
}catch(e){await page.screenshot({path:'artifacts/interactive/browser-failure.png',fullPage:true});console.log('events',await page.evaluate(()=>window.rcProof?.events));throw e;}finally{await browser.close();}
