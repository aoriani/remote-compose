import{chromium}from'playwright';import{readFile,writeFile}from'node:fs/promises';import assert from'node:assert/strict';
const base=process.env.RC_TEST_URL||'http://127.0.0.1:8092',response=await fetch(base+'/api/compile',{method:'POST',body:await readFile('samples/repros/shared-action-name.json','utf8')});assert.equal(response.status,200);const bytes=new Uint8Array(await response.arrayBuffer());
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage();
try{await page.goto(base);await page.waitForFunction(()=>window.RC);
 await page.evaluate(async data=>{const canvas=document.createElement('canvas');canvas.width=390;canvas.height=844;canvas.id='repro';document.body.replaceChildren(canvas);window.repro=new RC.RcdPlayer(canvas);const d=await window.repro.loadFromArrayBuffer(new Uint8Array(data).buffer);window.reproDoc=d;window.reproEvents=[];d.addActionCallback({onAction(name,value){window.reproEvents.push({name,value});}});},Array.from(bytes));
 await page.locator('#repro').click({position:{x:100,y:96}});let events=await page.evaluate(()=>window.reproEvents);assert.deepEqual(events,[{name:null,value:'second'}]);
 await page.evaluate(async()=>{const {initializeNestedText}=await import('/editor/player-adapter.mjs');initializeNestedText(window.repro,window.reproDoc);});
 await page.locator('#repro').click({position:{x:100,y:96}});events=await page.evaluate(()=>window.reproEvents);assert.deepEqual(events[1],{name:'repro.echo',value:'second'});
 await writeFile('artifacts/interactive/resource-repro.json',JSON.stringify({unadapted:events[0],adapted:events[1],bytes:bytes.length},null,2));console.log('Reproduced missing nested action name and verified generic data-only repair');
}finally{await browser.close();}
