import{chromium}from'playwright';import assert from'node:assert/strict';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1500,height:1100}});let requests=0;
try{
 await page.goto(process.env.RC_TEST_URL||'http://127.0.0.1:8092');await page.waitForFunction(()=>window.rcProof?.ready);await page.locator('#reset').click();await page.waitForFunction(()=>!document.querySelector('#preview').disabled&&document.querySelector('#source').value.includes('promo_interval'));
 page.on('request',r=>{if(r.url().includes('/api/'))requests++});
 const canvas=page.locator('#phone canvas'),b=await canvas.boundingBox();const tap=(x,y)=>page.mouse.click(b.x+x*b.width/390,b.y+y*b.height/844);
 const pixels=()=>canvas.evaluate(c=>{const ctx=c.getContext('2d');return {heart:Array.from(ctx.getImageData(28,578,40,36).data),count:Array.from(ctx.getImageData(278,578,44,36).data),category:Array.from(ctx.getImageData(132,380,64,28).data)};});
 const initial=await pixels();await tap(48,594);await page.waitForTimeout(100);const favorite=await pixels();assert.notDeepEqual(favorite.heart,initial.heart);await canvas.screenshot({path:'artifacts/interactive/browser-favorite-selected.png'});
 await tap(164,392);await page.waitForTimeout(100);assert.notDeepEqual((await pixels()).category,initial.category);
 for(let i=0;i<12;i++)await tap(346,594);await page.waitForTimeout(100);assert.notDeepEqual((await pixels()).count,initial.count);assert.equal((await page.evaluate(()=>window.rcProof.events)).at(-1).value,12);
 for(let i=0;i<14;i++)await tap(250,594);assert.equal((await page.evaluate(()=>window.rcProof.events)).at(-1).value,0);
 for(let i=0;i<8;i++)await tap(345,286);await page.waitForTimeout(600);await tap(100,80);
 const events=await page.evaluate(()=>window.rcProof.events);assert.equal(events.length,37);assert.ok(Number.isInteger(events.at(-1).value)&&events.at(-1).value>=0&&events.at(-1).value<3);assert.equal(requests,0,'Local interactions must not request backend compilation or state');
 await writeFile('artifacts/interactive/stress-proof.json',JSON.stringify({favoritePixelsChanged:true,categoryPixelsChanged:true,quantityPixelsChanged:true,quantityPeak:12,quantityFloor:0,rapidCarouselClicks:8,events:events.length,backendRequests:requests},null,2));console.log('Visual local-state feedback, quantity limits, rapid navigation and no-server interaction checks passed');
}finally{await browser.close();}
