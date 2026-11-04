/** Exercise the user's paste path for large multiline source.
 * Chromium Input.insertText (used by Playwright fill) emits ~2 events per line;
 * real clipboard paste emits one. Preserve and restore supported clipboard formats.
 */
export async function pasteJson(page, text) {
 await page.context().grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(page.url()).origin});
 await page.evaluate(async value=>{
  window.__editorTestClipboard=await navigator.clipboard.read();
  await navigator.clipboard.writeText(value);
 },text);
 try {
  await page.locator('#source').focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('ControlOrMeta+V');
  await page.waitForFunction(value=>document.querySelector('#source').value===value,text);
 } finally {
  await page.evaluate(async()=>{
   const previous=window.__editorTestClipboard;
   if(previous?.length)await navigator.clipboard.write(previous);
   else await navigator.clipboard.writeText('');
   delete window.__editorTestClipboard;
  });
 }
}
