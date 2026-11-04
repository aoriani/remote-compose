import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

/** Real editor controls against an isolated backend; no editor-model mutations. */
export async function runLifecycle(base, folder) {
 await mkdir(folder,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1500,height:1100}}),page=await context.newPage();
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const source=()=>page.locator('#source').inputValue();
 const stable=()=>page.evaluate(()=>window.rcProof.sha256);
 const metadata=async()=>{const r=await fetch(base+'/api/documents/latest/metadata');return r.status===404?null:r.json();};
 const idle=()=>page.waitForFunction(()=>!document.querySelector('#preview').disabled);
 const raw=async value=>{await page.locator('#json-tab').click();await page.locator('#source').fill(typeof value==='string'?value:JSON.stringify(value));};
 const apply=async value=>{await raw(value);await page.locator('#apply').click();await idle();assert.match(await page.locator('#status').textContent(),/Valid document/);};
 const good={header:{width:390,height:844,profiles:512},root:{type:'column',modifiers:[{fillMaxSize:1},{background:'#F5F4EF'}],children:[{type:'text',value:'Lifecycle A',fontSize:24,color:'#203B73'},{type:'canvas',modifiers:[{height:110},{fillMaxWidth:1}],commands:[{type:'paint',ops:[{color:'#305BEF'}]},{type:'drawCircle',cx:60,cy:50,radius:30}]}]}};
 const changed=structuredClone(good);changed.root.children[0].value='Lifecycle B';changed.root.children[1].commands[1].radius=24;
 const record=(name,details={})=>{results.push({name,passed:true,...details});console.log('PASS',name);};
 const screenshot=name=>page.screenshot({path:resolve(folder,name+'.png'),fullPage:true});
 try {
  await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready);
  await apply(good);await page.locator('#publish').click();await idle();const first=await metadata(),sha=await stable();assert.equal(first.sha256,sha);
  await raw(changed);assert.equal((await metadata()).sha256,sha);await page.locator('#apply').click();await idle();assert.notEqual(await stable(),sha);assert.equal((await metadata()).sha256,sha);
  record('draft and preview do not publish');
  const preview=await stable();
  for(const [kind,handler] of [
   ['offline',route=>route.abort('connectionfailed')],
   ['server error',route=>route.fulfill({status:503,contentType:'text/html',body:'Service temporarily unavailable'})]
  ]) {
   await page.route('**/api/publish',handler);await page.locator('#publish').click();await idle();
   assert.match(await page.locator('#status').textContent(),kind==='offline'?/fetch|network/i:/HTTP 503/);assert.equal(await stable(),preview);assert.equal((await metadata()).version,first.version);
   assert.equal(await page.locator('#publish').isEnabled(),true);await page.unroute('**/api/publish');record('publish '+kind+' retains document and recovers controls');
  }
  await page.locator('#publish').click();await idle();const second=await metadata();assert.equal(second.sha256,preview);assert.ok(second.version>first.version);
  const bytes=Buffer.from(await(await fetch(base+'/api/documents/latest')).arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),preview);
  const etag=(await fetch(base+'/api/documents/latest')).headers.get('etag');assert.equal((await fetch(base+'/api/documents/latest',{headers:{'If-None-Match':etag}})).status,304);
  assert.equal(createHash('sha256').update(Buffer.from(await(await fetch(base+`/api/documents/${first.version}`)).arrayBuffer())).digest('hex'),sha);
  record('publication recovery, immutable prior bytes and conditional fetch');
  // Exact downloaded source, including developer formatting, is portable.
  await page.locator('#format').click();const formatted=await source();const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'remote-compose.json');assert.equal(await readFile(await download.path(),'utf8'),formatted);record('export exact primitive JSON');
  await page.reload();await page.waitForFunction(()=>window.rcProof?.ready);assert.equal(await source(),formatted);assert.equal(await stable(),preview);record('valid custom draft survives reload');
  await raw('{"root":');await page.reload();await page.waitForFunction(()=>document.querySelector('#status').classList.contains('error'));assert.equal(await source(),'{"root":');assert.equal(await page.locator('#json-panel').isVisible(),true);assert.equal((await metadata()).version,second.version);record('malformed draft survives reload and stays unpublished');
  await apply(good);const beforeLoad=await source();const beforeHash=await stable();
  await page.route('**/api/documents/latest/metadata',route=>route.abort());await page.locator('#load-published').click();await page.waitForFunction(()=>/fetch|network/i.test(document.querySelector('#status').textContent));assert.equal(await source(),beforeLoad);assert.equal(await stable(),beforeHash);await page.unroute('**/api/documents/latest/metadata');record('load-published network failure preserves draft and preview');
  let compileRequests=0;const onRequest=r=>{if(r.url().endsWith('/api/compile'))compileRequests++;};page.on('request',onRequest);
  await page.locator('#load-published').click();await page.waitForFunction(v=>window.rcProof.loadedVersion===v,second.version);assert.equal(compileRequests,0);assert.equal(await stable(),preview);assert.deepEqual(JSON.parse(await source()),changed);page.off('request',onRequest);record('load-published fetches exact immutable bytes without recompiling');
  // Empty document must recover through the palette, even after deleting its final section.
  const empty={header:good.header,root:{type:'column',modifiers:[{fillMaxSize:1},{background:'#FFFFFF'}],children:[]}};
  await apply(empty);assert.equal(await page.locator('#outline button').count(),0);
  for(const op of ['up','down','duplicate','delete']){await page.locator(`[data-op="${op}"]`).click();assert.deepEqual(JSON.parse(await source()),empty);}
  await page.locator('[data-template="text"]').click();assert.equal(await page.locator('#outline button').count(),1);await page.locator('[data-op="delete"]').click();assert.equal(await page.locator('#outline button').count(),0);await page.locator('[data-template="button"]').click();await page.locator('#preview').click();await idle();assert.match(await page.locator('#status').textContent(),/Valid document/);record('empty document and last-section deletion recover through palette');
  // Invalid numeric fields are rejected without damaging source or unrelated sections.
  await apply(empty);await page.locator('[data-template="image"]').click();await page.locator('#properties-tab').click();const size=page.locator('#properties input[type="number"]').first(),beforeInvalid=await source();
  for(const value of ['','-1','500']){await size.fill(value);await size.press('Tab');assert.equal(await source(),beforeInvalid);assert.equal(await page.locator('#status').evaluate(e=>e.classList.contains('error')),true);}
  await size.fill('144');await size.press('Tab');await page.locator('#preview').click();await idle();assert.match(await page.locator('#status').textContent(),/Valid document/);record('invalid property values preserve source; corrected values compile');
  // Keyboard navigation and all editor rail destinations remain reachable.
  await page.locator('#rail-json').click();assert.equal(await page.locator('#source').evaluate(e=>e===document.activeElement),true);
  await page.locator('#rail-library').click();await page.locator('#rail-layers').click();await page.locator('#preview').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'publish');record('editor rail actions and keyboard focus');
  // Adversarial slow loads: edits made after clicking Load must not be silently discarded.
  await apply(good);let release,arrived;const gate=new Promise(r=>release=r),seen=new Promise(r=>arrived=r);
  await page.route('**/api/documents/*/source',async route=>{arrived();await gate;await route.continue();});
  await page.locator('#load-published').click();await seen;for(const id of ['preview','publish','apply','refresh','load-published'])assert.equal(await page.locator('#'+id).isDisabled(),true);const draft=structuredClone(good);draft.root.children[0].value='Typed while loading published';await raw(draft);release();
  await idle();assert.deepEqual(JSON.parse(await source()),draft,'A late load-published response must not discard newer typing');assert.equal(await stable(),sha);
  await page.unroute('**/api/documents/*/source');record('late published load preserves newer draft');
  const draftText=await source();await page.route('**/api/documents/*/source',route=>route.fulfill({status:200,contentType:'application/json',body:'{broken'}));
  await page.locator('#load-published').click();await idle();assert.equal(await source(),draftText);assert.equal(await stable(),sha);assert.equal(await page.locator('#status').evaluate(e=>e.classList.contains('error')),true);await page.unroute('**/api/documents/*/source');record('malformed published source retains draft and canvas');
  await page.locator('#load-published').click();await idle();assert.deepEqual(JSON.parse(await source()),changed);assert.equal(await stable(),preview);record('published-load recovery after stale and malformed responses');
  // Publishing submits one immutable snapshot even when a newer draft is typed in flight.
  await apply(good);let publishRelease,publishSeen,publishPosts=0;
  const publishGate=new Promise(r=>publishRelease=r),publishArrival=new Promise(r=>publishSeen=r);
  await page.route('**/api/publish',async route=>{publishPosts++;publishSeen();await publishGate;await route.continue();});
  await page.locator('#publish').click();await publishArrival;const buttonBounds=await page.locator('#publish').boundingBox();
  await page.mouse.click(buttonBounds.x+buttonBounds.width/2,buttonBounds.y+buttonBounds.height/2);
  await raw(changed);publishRelease();await idle();assert.equal(publishPosts,1);assert.deepEqual(JSON.parse(await source()),changed);
  assert.equal((await metadata()).sha256,sha);assert.match(await page.locator('#status').textContent(),/current draft has newer edits/);
  await page.unroute('**/api/publish');record('in-flight publish submits once and preserves newer draft');
  // Search empty state must be reversible and not insert a hidden asset accidentally.
  const assetBefore=await source();await page.locator('#asset-search').fill('no-such-product-123');assert.equal(await page.locator('#asset-gallery button').count(),0);assert.equal(await page.locator('#insert-asset').isDisabled(),true);assert.equal(await source(),assetBefore);
  await page.locator('#asset-search').fill('');assert.equal(await page.locator('#asset-gallery button').count(),4);record('asset search empty state and recovery');
  await apply(empty);await page.locator('[data-template="text"]').click();await page.locator('#properties-tab').click();
  for(let i=0;i<12;i++){const field=page.locator('#properties input').first();await field.fill('Rapid heading '+i);await field.press('Tab');}
  assert.equal(JSON.parse(await source()).root.children[0].value,'Rapid heading 11');await page.locator('#preview').click();await idle();assert.match(await page.locator('#status').textContent(),/Valid document/);record('rapid property edits compile the final value');
  let nested={type:'text',value:'Twenty nested boxes',fontSize:18};for(let i=0;i<20;i++)nested={type:'box',modifiers:[{fillMaxWidth:1},{height:60}],children:[nested]};
  await apply({header:good.header,root:nested});record('twenty-level uncatalogued primitive hierarchy compiles and renders');
  const nestedSha=await stable();for(let i=0;i<20;i++)nested={type:'box',children:[nested]};
  await raw({header:good.header,root:nested});await page.locator('#apply').click();await idle();assert.match(await page.locator('#status').textContent(),/nesting depth.*maximum allowed/s);assert.equal(await stable(),nestedSha);record('over-limit nesting returns a useful diagnostic and retains preview');
  await apply(good);await page.locator('#json-tab').click();await page.locator('#format').click();assert.ok(await page.locator('#highlight .key').count()>0);assert.ok(await page.locator('#highlight .string').count()>0);
  const panel=await page.locator('#source').boundingBox();assert.ok(panel.width>150&&panel.height>100);record('editable JSON has visible syntax-highlight layers');
  await screenshot('lifecycle');assert.deepEqual(errors,[]);
  await writeFile(resolve(folder,'lifecycle-results.json'),JSON.stringify({results,errors,browser:browser.version()},null,2));return results;
 }catch(error){await screenshot('failure');await writeFile(resolve(folder,'failure.json'),JSON.stringify({error:String(error),status:await page.locator('#status').textContent(),results,errors},null,2));throw error;}
 finally{await browser.close();}
}
