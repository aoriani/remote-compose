// Native regression handoff: author a visible full-page change via scoped JSON, then publish.
import{chromium}from'playwright';import assert from'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
const base=process.env.RC_TEST_URL||'http://127.0.0.1:8092',folder='artifacts/selection-native';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1500,height:1100}});
try{
 await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready);const original=JSON.parse(await page.locator('#source').inputValue());
 await page.locator('#mode-select').click();const box=await page.locator('#phone canvas').boundingBox();await page.mouse.click(box.x+100*box.width/390,box.y+200*box.height/844);
 assert.equal(await page.locator('#component-path').textContent(),'root.children[2]');const node=JSON.parse(await page.locator('#component-source').inputValue()),headline=node.commands.find(x=>x.text==='Good things.');assert.ok(headline);headline.text='Fresh picks.';
 await page.locator('#component-source').fill(JSON.stringify(node,null,2));await page.locator('#component-apply').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);assert.match(await page.locator('#status').textContent(),/Valid document/);
 const expected=structuredClone(original);expected.root.children[2]=node;assert.deepEqual(JSON.parse(await page.locator('#source').inputValue()),expected);
 await page.locator('#publish').click();await page.waitForFunction(()=>!document.querySelector('#publish').disabled);const metadata=await page.evaluate(()=>window.rcProof.published);assert.ok(metadata?.version);
 const bytes=Buffer.from(await(await fetch(base+`/api/documents/${metadata.version}`)).arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),metadata.sha256);assert.equal(await page.evaluate(()=>window.rcProof.sha256),metadata.sha256);
 await page.screenshot({path:folder+'/editor-published.png',fullPage:true});await page.locator('#phone canvas').screenshot({path:folder+'/browser.png'});
 await writeFile('samples/full-retail-run.json',JSON.stringify(metadata,null,2));await writeFile(folder+'/publication.json',JSON.stringify({metadata,sourcePath:'root.children[2]',changedText:'Good things. → Fresh picks.',sameOtherSubtrees:true,authoredThroughScopedEditor:true},null,2));console.log('SCOPED_PUBLICATION',metadata.version,metadata.sha256,metadata.bytes);
}finally{await browser.close();}
