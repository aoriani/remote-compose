import {pasteJson} from './editor-input.mjs';
import{chromium}from'playwright';import{readFile,writeFile}from'node:fs/promises';import assert from'node:assert/strict';
const base=process.env.RC_TEST_URL||'http://127.0.0.1:8092',browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1100}});
try{
 await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready);await page.locator('#json-tab').click();await pasteJson(page,await readFile('samples/interactive-retail.json','utf8'));await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);
 await page.locator('#outline button').nth(4).click();await page.locator('#properties-tab').click();
 const field=label=>page.locator('#properties label').filter({hasText:label}).locator('input');
 const edit=async(label,value)=>{await field(label).fill(String(value));await field(label).press('Tab');};
 await edit('Rotation interval',6);await edit('Slide duration',.3);
 await page.getByRole('button',{name:'Move banner 2 up',exact:true}).click();
 assert.equal(JSON.parse(await page.locator('#source').inputValue()).root.children[4].children[15].commands[9].text,'Bring home');
 await edit('Number of slides',4);await edit('Show arrow controls',0);await edit('Show position indicators',0);
 const node=JSON.parse(await page.locator('#source').inputValue()).root.children[4];assert.equal(node.children[0].value,6);assert.equal(node.children[1].value,.3);assert.equal(node.children[14].value,4);
 for(const n of [4,2,5,3]){await edit('Number of slides',n);await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);assert.match(await page.locator('#status').textContent(),/Valid document/);assert.ok(await page.locator('#properties h2').textContent()==='Promotional carousel');}
 await edit('Show arrow controls',1);await edit('Show position indicators',1);
 // Modified action identifiers and visibility must affect actual player input, not just JSON.
 await edit('Rotation interval',2);await edit('Promotion action identifier','offer.inspector');
 const controlFields=page.locator('#properties label').filter({hasText:'Control action identifier'}).locator('input');
 const names=['offer.previous','offer.select.0','offer.select.1','offer.select.2','offer.next'];
 for(let i=0;i<names.length;i++){await controlFields.nth(i).fill(names[i]);await controlFields.nth(i).press('Tab');}
 const compile=async()=>{await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);assert.match(await page.locator('#status').textContent(),/Valid document/);};
 const tap=async(x,y)=>{const b=await page.locator('#phone canvas').boundingBox();await page.mouse.click(b.x+x*b.width/390,b.y+y*b.height/844);await page.waitForTimeout(80);};
 const event=async(x,y,name,value)=>{const n=await page.evaluate(()=>window.rcProof.events.length);await tap(x,y);const events=await page.evaluate(n=>window.rcProof.events.slice(n),n);assert.equal(events.length,1);assert.equal(events[0].name,name);if(value!==undefined)assert.equal(events[0].value,value);};
 await compile();await event(151,716,'offer.select.0');await page.waitForTimeout(350);
 await event(44,716,'offer.previous');await page.waitForTimeout(350);await event(100,510,'offer.inspector',2);
 await event(345,716,'offer.next');await page.waitForTimeout(350);await event(100,510,'offer.inspector',0);
 await page.waitForTimeout(1800);await event(100,510,'offer.inspector',1);
 await edit('Show arrow controls',0);await edit('Show position indicators',0);await compile();const count=await page.evaluate(()=>window.rcProof.events.length);
 await tap(44,716);await tap(195,716);await tap(345,716);assert.equal(await page.evaluate(()=>window.rcProof.events.length),count,'Hidden controls must not retain invisible hit targets');
 await edit('Show arrow controls',1);await edit('Show position indicators',1);await compile();
 await page.screenshot({path:'artifacts/interactive/carousel-inspector.png',fullPage:true});
 // True player frames under a deterministic test-only clock, no JS-driven carousel.
 const bytes=await(await fetch(base+'/api/compile',{method:'POST',body:await readFile('samples/interactive-retail.json','utf8')})).arrayBuffer();
 await page.evaluate(async b=>{const c=document.createElement('canvas');c.id='clock-gallery';c.width=390;c.height=844;document.body.replaceChildren(c);window.clockPlayer=new RC.RcdPlayer(c);await window.clockPlayer.loadFromArrayBuffer(new Uint8Array(b).buffer);},Array.from(new Uint8Array(bytes)));
 for(const phase of [4.55,4.775,5]){assert.equal(await page.evaluate(t=>RC.pinClock(window.clockPlayer,t,t),phase),true);await page.waitForTimeout(120);await page.locator('#clock-gallery').screenshot({path:`artifacts/interactive/phase-${phase}.png`});}
 await writeFile('artifacts/interactive/editor-config.json',JSON.stringify({propertyEdits:true,slideOrdering:true,countsCompiled:[2,3,4,5],visibility:true,primitiveSerialization:true,editedCallbacksObserved:true,editedTwoSecondAutoAdvance:true,hiddenControlsDoNotReceiveTaps:true,deterministicFrames:[4.55,4.775,5]},null,2));console.log('Carousel editor properties, ordering, serialization and deterministic real-player frames passed');
}catch(error){await page.screenshot({path:'artifacts/interactive/carousel-failure.png',fullPage:true});console.log('Inspector failure',await page.locator('#source').evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),active:document.activeElement.id,panel:getComputedStyle(document.querySelector('#json-panel')).display,status:document.querySelector('#status').textContent})));throw error;}finally{await browser.close();}
