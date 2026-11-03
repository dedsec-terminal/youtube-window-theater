import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
const ext=path.resolve('dist/chrome');
const context=await chromium.launchPersistentContext('',{channel:'chromium',headless:true,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
try{
let worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker');
const id=new URL(worker.url()).host;
const popup=await context.newPage();await popup.goto(`chrome-extension://${id}/popup.html`);
await popup.locator('#nonStopEnabled:checked').waitFor();await popup.locator('#autoEnable:checked').waitFor();assert.equal(await popup.locator('#fullscreenShortcut').inputValue(),'d');assert.equal(await popup.locator('a').count(),0);assert.equal(await popup.locator('#toggleFullscreen').count(),0);await popup.locator('#nonStopEnabled').check();await popup.locator('#autoEnable').check();await popup.locator('#editFullscreenShortcut').click();await popup.locator('#fullscreenShortcut').press('w');await popup.locator('#saveShortcut').click();
await popup.waitForFunction(()=>document.querySelector('#displayFullscreenShortcut').textContent==='w');
await popup.screenshot({path:'dist/artifacts/popup.png'});await popup.reload();await popup.locator('#autoEnable:checked').waitFor();assert.equal(await popup.locator('#fullscreenShortcut').inputValue(),'w');
const page=await context.newPage();await page.goto('https://www.youtube.com/watch?v=jNQXAC9IVRw',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>typeof document.querySelector('video')?.yns_pause==='function');
await page.waitForFunction(()=>document.documentElement.classList.contains('ytif-fullscreen'),{timeout:30000});
await popup.locator('#nonStopEnabled').uncheck();
await page.waitForTimeout(5500);
assert.equal(await page.evaluate(()=>{const v=document.querySelector('video');const orig=v.yns_pause;let calls=0;v.yns_pause=()=>calls++;try{v.pause();return calls;}finally{v.yns_pause=orig;}}),1);
await popup.locator('#nonStopEnabled').check();await page.waitForTimeout(1000);
assert.equal(await page.evaluate(()=>{const v=document.querySelector('video');const orig=v.yns_pause;let calls=0;v.yns_pause=()=>calls++;try{v.pause();return calls;}finally{v.yns_pause=orig;}}),0);
await page.keyboard.press('Escape');await page.waitForTimeout(200);await page.keyboard.press('w');assert.ok(await page.evaluate(()=>document.documentElement.classList.contains('ytif-fullscreen')));
console.log('PASS: popup renders, settings persist, automatic fullscreen activates, W shortcut works, NonStop switches off/on live.');
}finally{await context.close();}
