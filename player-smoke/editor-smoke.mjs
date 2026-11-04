import {chromium} from 'playwright';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
import {catalog,createWidget,legacyDesignedDocument as initialDocument,sections,assetSlots,patch} from '../web-editor/model.mjs';
import {createHash} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=await mkdtemp(resolve(tmpdir(),'rc-editor-test-'));
const server=spawn(resolve(root,'pipeline/build/install/pipeline/bin/pipeline'),['serve','0',data],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
await mkdir(resolve(root,'artifacts'),{recursive:true});
let logs='';server.stderr.on('data',x=>logs+=x);let browser;
try{
 const base=await new Promise((ok,no)=>{const t=setTimeout(()=>no(Error('Server timeout '+logs)),15000);server.once('exit',()=>no(Error('Server exited '+logs)));server.stdout.on('data',x=>{const m=x.toString().match(/http:\/\/127.0.0.1:\d+/);if(m){clearTimeout(t);ok(m[0]);}});});
 for(const {id} of catalog){const r=await fetch(base+'/api/compile',{method:'POST',body:JSON.stringify({header:{width:390,height:844,profiles:512,fps:60},root:createWidget(id)})});assert.equal(r.status,200,id+': '+(r.ok?'':await r.text()));}
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1500,height:1100},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/unknown operation|unknown tag/i.test(m.text()))errors.push(m.text());});
 await page.addInitScript(()=>{window.bitmapDraws=0;const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){if(a[0].naturalWidth>=640)window.bitmapDraws++;return draw.apply(this,a);};window.arcObservations=[];window.rectObservations=[];const arc=CanvasRenderingContext2D.prototype.arc;CanvasRenderingContext2D.prototype.arc=function(...a){if(a[0]===48&&a[1]===48)window.arcObservations.push(a[2]);return arc.apply(this,a);};const fill=CanvasRenderingContext2D.prototype.fillRect;CanvasRenderingContext2D.prototype.fillRect=function(...a){if(a[0]===20&&a[1]===67)window.rectObservations.push(a[2]);return fill.apply(this,a);};});
 await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready||window.rcProof?.lastError);assert.equal(await page.evaluate(()=>window.rcProof.lastError),undefined,await page.locator('#status').textContent());
 await page.waitForFunction(()=>window.bitmapDraws>0);
 await page.waitForFunction(()=>document.querySelectorAll('#asset-gallery button').length===4);
 await page.locator('#asset-search').fill('granola');assert.equal(await page.locator('#asset-gallery button').count(),1);
 await page.locator('[data-asset="granola"]').click();await page.locator('#insert-asset').click();
 let assetDoc=JSON.parse(await page.locator('#source').inputValue());assert.equal(assetSlots(sections(assetDoc).at(-1))[0].value,'granola');
 await page.locator('#asset-search').fill('');await page.locator('[data-asset="citrus-soda"]').click();await page.locator('#replace-asset').click();
 let replaced=JSON.parse(await page.locator('#source').inputValue());const expectedAsset=structuredClone(assetDoc);patch(sections(expectedAsset).at(-1),assetSlots(sections(expectedAsset).at(-1))[0].path,'citrus-soda');assert.deepEqual(replaced,expectedAsset);
 // A completely custom bitmap subtree remains replaceable without template recognition.
 sections(replaced).at(-1).commands.push({type:'drawCircle',cx:4,cy:4,radius:2});
 await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify(replaced));await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);await page.locator('#properties-tab').click();
 await page.locator('[data-asset="oat-milk"]').click();await page.locator('#replace-asset').click();
 const customAsset=JSON.parse(await page.locator('#source').inputValue());patch(sections(replaced).at(-1),assetSlots(sections(replaced).at(-1))[0].path,'oat-milk');assert.deepEqual(customAsset,replaced);
 await page.screenshot({path:resolve(root,'artifacts/redesign/asset-inspector.png'),fullPage:true});
 await page.locator('[data-template="products"]').click();await page.locator('#properties-tab').click();await page.locator('#asset-target').selectOption('1');
 const multiBefore=JSON.parse(await page.locator('#source').inputValue());await page.locator('[data-asset="granola"]').click();await page.locator('#replace-asset').click();
 const multiAfter=JSON.parse(await page.locator('#source').inputValue());patch(sections(multiBefore).at(-1),assetSlots(sections(multiBefore).at(-1))[1].path,'granola');assert.deepEqual(multiAfter,multiBefore);assert.equal(await page.locator('#asset-target').inputValue(),'1');
 // Compare actual player pixels after swapping a bitmap in a custom primitive subtree.
 await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify({header:{width:390,height:844,profiles:512},root:sections(customAsset).at(-1)}));await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const pixels=()=>page.locator('#phone canvas').evaluate(async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,390,200).data))).join(','));
 const beforePixels=await pixels();await page.locator('#properties-tab').click();await page.locator('[data-asset="granola"]').click();await page.locator('#replace-asset').click();await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.notEqual(await pixels(),beforePixels);
 // The redesigned animations are below the first fold; measure them in a visible fixture.
 await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify({header:{width:390,height:844,profiles:512,fps:60},root:{type:'column',children:[createWidget('badge'),createWidget('progress')]}}));await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);
 await page.waitForFunction(()=>window.arcObservations.length>5&&Math.max(...window.arcObservations)-Math.min(...window.arcObservations)>1);
 await page.waitForFunction(()=>window.rectObservations.length>5&&Math.max(...window.rectObservations)-Math.min(...window.rectObservations)>1);
 // Review every visual template through the actual controls, not only its factory.
 const customReview={type:'box',modifiers:[{height:24},{background:'@reviewColor'}],children:[{type:'text',value:'Custom subtree survives'}]};
 const reviewDoc=initialDocument();reviewDoc.resources={colors:{reviewColor:'#E4D5FF'}};reviewDoc.root.children.unshift(customReview);
 await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify(reviewDoc));
 await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);
 for(const {id} of catalog){
  const before=JSON.parse(await page.locator('#source').inputValue());
  await page.locator(`[data-template="${id}"]`).click();await page.locator('#properties-tab').click();
  const field=page.locator('#properties input').first();const old=await field.inputValue();
  const edited=(await field.getAttribute('type'))==='number'?String(Number(old)+(id==='image'?-8:1)):old+(id==='badge'||id==='progress'?' + 0':' reviewed');
  await field.fill(edited);await field.press('Tab');
  const added=JSON.parse(await page.locator('#source').inputValue());
  assert.equal(sections(added).length,sections(before).length+1,id);
  if(id==='image')assert.equal(sections(added).at(-1).commands[3].right-sections(added).at(-1).commands[3].left,Number(edited));else assert.ok(JSON.stringify(added).includes(edited),id+' property edit');
  await page.locator('[data-op="up"]').click();await page.locator('[data-op="down"]').click();
  await page.locator('[data-op="duplicate"]').click();
  if(id==='carousel')assert.match(await page.locator('#status').textContent(),/declares IDs or variables/);
  else {
   assert.equal(await page.locator('#outline .selected').textContent(),`${sections(added).length+1}. ${catalog.find(x=>x.id===id).label}`);
   await page.locator('[data-op="delete"]').click();
  }
  const afterUI=JSON.parse(await page.locator('#source').inputValue());
  assert.equal(JSON.stringify(sections(afterUI)[0]),JSON.stringify(customReview));
  assert.deepEqual(afterUI,added,id+' move/duplicate/delete preserve source');
  await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);
  assert.ok(!(await page.locator('#status').textContent()).includes('errors'),id+' edited preview');
  assert.equal(await page.locator('#draft-state').textContent(),'Preview matches draft');
  // Delete the reviewed template; the next iteration starts with the same custom tree.
  await page.locator('[data-op="delete"]').click();
 }
 // Explicitly compare the exact JVM HTTP response bytes with the player's loaded bytes.
 await page.locator('#json-tab').click();await page.locator('#source').fill(JSON.stringify(initialDocument()));
 const compiled=page.waitForResponse(r=>r.url()===base+'/api/compile'&&r.request().method()==='POST');
 await page.locator('#preview').click();const exact=Buffer.from(await(await compiled).body());
 await page.waitForFunction(()=>!document.querySelector('#preview').disabled);
 assert.equal(await page.evaluate(()=>window.rcProof.sha256),createHash('sha256').update(exact).digest('hex'));
 assert.equal(await page.locator('#phone').locator('canvas').count(),1);
 await page.screenshot({path:resolve(root,'artifacts/readiness-desktop.png'),fullPage:true});
 for(const width of [390,768,1100]){
  await page.setViewportSize({width,height:1000});
  await page.waitForFunction(()=>{const r=document.querySelector('.phone-frame').getBoundingClientRect();return r.x>=0&&r.right<=innerWidth;});
  await page.screenshot({path:resolve(root,`artifacts/readiness-${width}.png`),fullPage:true});
 }
 await page.setViewportSize({width:1500,height:1100});
 await page.locator('#zoom').selectOption('0.65');const small=await page.locator('.phone-frame').boundingBox();
 await page.locator('#zoom').selectOption('1');const large=await page.locator('.phone-frame').boundingBox();
 assert.ok(large.width>small.width&&large.height>small.height);await page.locator('#zoom').selectOption('0.85');
 const stable=await page.evaluate(()=>window.rcProof.sha256);
 await page.route('**/api/compile',route=>route.abort('connectionfailed'));
 await page.locator('#preview').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);
 assert.match(await page.locator('#status').textContent(),/fetch|Network/i);
 assert.equal(await page.evaluate(()=>window.rcProof.sha256),stable);
 await page.unroute('**/api/compile');
 await page.locator('#source').fill('{');await page.locator('#apply').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('MALFORMED_JSON'));
 assert.equal(await page.evaluate(()=>window.rcProof.sha256),stable);
 assert.equal(await page.locator('#draft-state').textContent(),'Draft changed • preview required');assert.equal(await page.locator('#compile-state').textContent(),'Needs attention');
 // A slow compilation must not install an obsolete draft over newer edits.
 await page.locator('#source').fill(JSON.stringify(initialDocument()));
 let release;const hold=new Promise(resolve=>release=resolve);
 await page.route('**/api/compile',async route=>{await hold;await route.continue();});
 await page.locator('#preview').click();
 await page.locator('#source').fill(JSON.stringify({...initialDocument(),header:{width:390,height:844,profiles:512,fps:30}}));
 release();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);
 assert.equal(await page.evaluate(()=>window.rcProof.sha256),stable);
 assert.match(await page.locator('#status').textContent(),/Draft changed during compilation/);
 await page.unroute('**/api/compile');
 await page.locator('#apply').click();await page.waitForFunction(()=>!document.querySelector('#apply').disabled);
 // Inject a fully new, uncatalogued composition through the real JSON editor.
 await page.locator('#json-tab').click();const original=JSON.parse(await page.locator('#source').inputValue());const custom={type:'box',modifiers:[{height:75},{background:'#E4D5FF'}],children:[{type:'canvas',commands:[{type:'paint',ops:[{color:'#7537B8'}]},{type:'drawCircle',cx:40,cy:35,radius:20}]}]};original.root.children.unshift(custom);await page.locator('#source').fill(JSON.stringify(original,null,2));await page.locator('#apply').click();await page.waitForFunction(()=>document.querySelector('#outline button')?.textContent.includes('Custom composition'));await page.locator('#outline button').first().click();await page.locator('[data-op="duplicate"]').click();await page.locator('[data-op="down"]').click();await page.locator('[data-template="text"]').click();const after=JSON.parse(await page.locator('#source').inputValue());assert.equal(after.root.children.filter(x=>JSON.stringify(x)===JSON.stringify(custom)).length,2);
 await page.locator('#publish').click();await page.waitForFunction(()=>window.rcProof?.published?.version===1);const metadata=await(await fetch(base+'/api/documents/latest/metadata')).json();const binary=await fetch(base+'/api/documents/latest');assert.equal(Number(binary.headers.get('x-document-version')),1);assert.equal(metadata.bytes,(await binary.arrayBuffer()).byteLength);
 // Exercise a real HostAction from a minimal remote button via browser pointer events.
 const actionDoc={header:{width:390,height:844,profiles:512},root:createWidget('button')};await page.locator('#source').fill(JSON.stringify(actionDoc));const previous=await page.evaluate(()=>window.rcProof.sha256);await page.locator('#apply').click();await page.waitForFunction(old=>window.rcProof.sha256!==old,previous);await page.locator('#phone canvas').click({position:{x:100,y:25}});await page.waitForFunction(()=>window.rcProof.events.some(x=>x.id===42));
 // Bad JSON must leave published bytes and the last valid preview untouched.
 const good=await page.evaluate(()=>window.rcProof.sha256);await page.locator('#source').fill('{"root":{"type":"businessWidget"}}');await page.locator('#publish').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('UNSUPPORTED_OPERATION'));assert.equal((await(await fetch(base+'/api/documents/latest/metadata')).json()).version,1);assert.equal(await page.evaluate(()=>window.rcProof.sha256),good);
 assert.deepEqual(errors,[]);await page.screenshot({path:resolve(root,'artifacts/editor.png'),fullPage:true});const report={assetsBrowsed:4,assetInsertionAndReplacement:true,customAssetReplacement:true,multipleImageSlotReplacement:true,replacedBitmapPixelsChanged:true,templatesCompiled:catalog.length,templatesExercisedThroughUI:catalog.length,responsiveWidths:[390,768,1100,1500],zoomFrameResize:true,staleCompilationPreserved:true,malformedPreviewPreserved:true,offlinePreviewPreserved:true,jvmResponseDigestMatched:true,animationsObserved:2,bitmapRendered:true,customCopiesPreserved:2,publishedVersion:1,hostEvent:42,browser:browser.version(),errors};await writeFile(resolve(root,'artifacts/editor-proof.json'),JSON.stringify(report,null,2));console.log(report);
}catch(error){const page=browser?.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:resolve(root,'artifacts/redesign/test-failure.png'),fullPage:true});console.log(await page.locator('#source').evaluate(e=>[e,...function*(n){while(n.parentElement){n=n.parentElement;yield n;}}(e)].map(n=>({tag:n.tagName,id:n.id,display:getComputedStyle(n).display,rect:[n.clientWidth,n.clientHeight],hidden:getComputedStyle(n).visibility}))));}throw error;}finally{await browser?.close();server.kill();}
