import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {recognize,patch} from '../web-editor/model.mjs';

export async function runEditorial(base,folder){
 await mkdir(folder,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1500,height:1100}}),errors=[],edits=[];page.on('pageerror',e=>errors.push(String(e)));
 const source=async()=>JSON.parse(await page.locator('#source').inputValue()),idle=()=>page.waitForFunction(()=>!document.querySelector('#preview').disabled);
 const jumpStory=async index=>{await page.locator('.property-group-nav button').nth(index).click();await page.waitForFunction(group=>{const h=document.querySelector(`[data-property-group="${group}"]`).getBoundingClientRect(),p=document.querySelector('.editing').getBoundingClientRect();return h.y>=p.y&&h.y<p.y+160;},`Story ${index+1}`);};
 async function apply(doc){await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify(doc));await page.locator('#apply').click();await idle();assert.match(await page.locator('#status').textContent(),/Valid document/);}
 try{
  await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready);const original=await source(),initialHash=await page.evaluate(()=>window.rcProof.sha256);
  assert.equal(initialHash,'5f32c3221aa7ce717151c6f0adb8e591de968abe2b172f97bff511748d258bda','Inspector controls must not change default document bytes');
  await page.locator('#outline button').nth(9).click();await page.locator('#properties-tab').click();assert.equal(await page.locator('#properties h2').textContent(),'Editorial stories');
  const fields=recognize(original.root.children[9]).fields;assert.equal(fields.length,31);assert.deepEqual(await page.locator('.property-group-nav button').allTextContents(),['Story 1','Story 2']);
  await jumpStory(1);
  const expected=structuredClone(original);
  for(let i=0;i<fields.length;i++){
   const f=fields[i],input=page.locator('#properties label').nth(i).locator('input,select'),tile=f.path[1];
   const value=f.type==='asset'?(tile===0?'oat-milk':'granola'):f.type==='number'?Number(f.value)+1:f.label.includes('Background color')?(tile===0?'#E7DFF2':'#E0E9D5'):f.label.includes('color')?'#483267':f.label.includes('Eyebrow')?(tile===0?'SLOW DAYS':'FRESH IDEAS'):f.label.includes('Headline line 1')?(tile===0?'A softer':'Better'):f.label.includes('Headline line 2')?(tile===0?'start.':'mornings.'):'Read the story →';
   if(f.type==='asset')await input.selectOption(value);else{await input.fill(String(value));await input.press('Tab');}
   patch(expected.root.children[9],f.path,value);assert.deepEqual(await source(),expected,`${f.label}: unexpected document changes`);assert.equal(await page.locator('#properties h2').textContent(),'Editorial stories');edits.push({label:f.label,path:f.path,value});
  }
  await page.locator('#preview').click();await idle();assert.match(await page.locator('#status').textContent(),/Valid document/);assert.notEqual(await page.evaluate(()=>window.rcProof.sha256),initialHash);
  // Existing saved compositions stay recognizable, including after direct JSON edits to tile 2.
  const roundTrip=await source();roundTrip.root.children[9].children[1].commands[7].text='New ideas';await apply(roundTrip);await page.locator('#outline button').nth(9).click();await page.locator('#properties-tab').click();assert.equal(await page.locator('#properties h2').textContent(),'Editorial stories');assert.equal(await page.locator('#properties label').filter({hasText:'Story 2 · Headline line 1'}).first().locator('input').inputValue(),'New ideas');
  // Put the same edited primitive subtree at the top to inspect both real rendered tiles.
  const custom={type:'text',value:'Unrelated custom section',fontSize:14},small={header:original.header,root:{type:'column',modifiers:[{fillMaxSize:1}],children:[roundTrip.root.children[9],custom]}};await apply(small);await page.locator('#outline button').first().click();await page.locator('#properties-tab').click();
  await jumpStory(0);await page.screenshot({path:resolve(folder,'story-one.png'),fullPage:true});
  await page.locator('#mode-interact').click();const b=await page.locator('#phone canvas').boundingBox();await page.mouse.move(b.x+b.width*.85,b.y+80*b.height/844);await page.mouse.down();await page.mouse.move(b.x+b.width*.12,b.y+80*b.height/844,{steps:20});await page.mouse.up();await page.waitForTimeout(450);await jumpStory(1);await page.screenshot({path:resolve(folder,'story-two.png'),fullPage:true});
  const pixels=await page.locator('#phone canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,200).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===224&&d[i+1]===233&&d[i+2]===213)n++;return n;});assert.ok(pixels>20000,'Second story background must be visible after real horizontal drag');
  const before=await source();for(const op of ['down','up','duplicate','delete'])await page.locator(`[data-op="${op}"]`).click();assert.deepEqual(await source(),before);assert.deepEqual((await source()).root.children[1],custom);
  // Also exercise the palette version, not only the bundled default.
  await page.locator('[data-template="news"]').click();await page.locator('#properties-tab').click();assert.equal(await page.locator('#properties label input').count(),29);assert.equal(await page.locator('#properties label select').count(),3);assert.equal(recognize((await source()).root.children.at(-1)).id,'news');
  assert.deepEqual(errors,[]);const result={edits,defaultBinaryUnchanged:initialHash,bundledDesign:true,palette:true,rawJsonRoundTrip:true,unrelatedSectionsPreserved:true,secondTileRendered:true,errors};await writeFile(resolve(folder,'results.json'),JSON.stringify(result,null,2));return result;
 }catch(e){await page.screenshot({path:resolve(folder,'failure.png'),fullPage:true});throw e;}finally{await browser.close();}
}
