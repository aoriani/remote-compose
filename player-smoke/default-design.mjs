import{chromium}from'playwright';import assert from'node:assert/strict';import{writeFile,mkdir}from'node:fs/promises';import{legacyDesignedDocument,initialDocument}from'../web-editor/model.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.RC_TEST_URL||'http://127.0.0.1:8080';await mkdir('artifacts/default-design',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1500,height:1100}}),page=await context.newPage();
 await page.goto(base);await page.waitForFunction(()=>window.rcProof?.ready||window.rcProof?.lastError);assert.equal(await page.evaluate(()=>window.rcProof.lastError),undefined);assert.deepEqual(JSON.parse(await page.locator('#source').inputValue()),initialDocument());await page.screenshot({path:'artifacts/default-design/startup.png',fullPage:true});
 const canvas=page.locator('#phone canvas'),b=await canvas.boundingBox();await page.mouse.click(b.x+345*b.width/390,b.y+716*b.height/844);await page.waitForFunction(()=>window.rcProof.events.some(e=>e.name==='carousel.next'));
 await page.locator('#reset').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled);assert.deepEqual(JSON.parse(await page.locator('#source').inputValue()),initialDocument());
 // Old untouched defaults migrate on reload, retaining a backup.
 const old=JSON.stringify(legacyDesignedDocument());await page.evaluate(s=>localStorage.setItem('rc-draft',s),old);await page.reload();await page.waitForFunction(()=>window.rcProof?.ready);assert.deepEqual(JSON.parse(await page.locator('#source').inputValue()),initialDocument());assert.equal(await page.evaluate(()=>localStorage.getItem('rc-draft-before-interactive-default')),old);
 // Edited drafts are never migrated or discarded.
 const custom=legacyDesignedDocument();custom.root.children[0].commands[7].text='My saved brand';const saved=JSON.stringify(custom);await page.evaluate(s=>localStorage.setItem('rc-draft',s),saved);await page.reload();await page.waitForFunction(()=>window.rcProof?.ready);assert.equal(await page.locator('#source').inputValue(),saved);
 await writeFile('artifacts/default-design/results.json',JSON.stringify({freshStartupInteractive:true,realPlayerEvent:'carousel.next',resetInteractive:true,fullRetailDefault:true,untouchedMigration:true,backupRetained:true,customDraftPreserved:true},null,2));console.log('Default design startup/reset, real player interaction, old-default migration and custom draft preservation passed');await context.close();
}finally{await browser.close();}
