import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
const ext=path.resolve('dist/chrome');
const c=await chromium.launchPersistentContext('',{channel:'chromium',headless:true,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
try{
 const w=c.serviceWorkers()[0]??await c.waitForEvent('serviceworker');const url=`chrome-extension://${new URL(w.url()).host}/popup.html`;
 let expected={nonStopEnabled:true,autoEnable:true,showButton:true,fullscreenShortcut:'d'};
 const errors=[];
 for(let i=0;i<20;i++){
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>!document.querySelector('#editFullscreenShortcut').disabled);
  for(const key of ['nonStopEnabled','autoEnable','showButton'])assert.equal(await p.locator('#'+key).isChecked(),expected[key]);
  assert.equal(await p.locator('#fullscreenShortcut').inputValue(),expected.fullscreenShortcut);
  const value=i%2===1;
  // Dispatch all three changes in one browser turn to exercise concurrent storage updates.
  await p.evaluate(value=>{for(const key of ['nonStopEnabled','autoEnable','showButton']){const el=document.getElementById(key);el.checked=value;el.dispatchEvent(new Event('change'));}},value);
  await p.locator('#editFullscreenShortcut').click();await p.locator('#fullscreenShortcut').press(i%2?'d':'w');await p.locator('#saveShortcut').click();
  expected={nonStopEnabled:value,autoEnable:value,showButton:value,fullscreenShortcut:i%2?'d':'w'};
  await p.waitForFunction(()=>document.querySelector('[role=status]').textContent==='');
  await p.close();
 }
 const p=await c.newPage();await p.goto(url);await p.waitForFunction(()=>!document.querySelector('#editFullscreenShortcut').disabled);
 await p.locator('#editFullscreenShortcut').click();await p.locator('#disableShortcut').click();await p.waitForFunction(()=>document.querySelector('[role=status]').textContent==='');
 assert.equal(await p.locator('#displayFullscreenShortcut').textContent(),'Disabled');
 await p.locator('#editFullscreenShortcut').click();await p.locator('#cancelShortcut').click();await p.waitForFunction(()=>document.querySelector('[role=status]').textContent==='');assert.equal(await p.locator('#fullscreenShortcut').inputValue(),'d');
 await p.evaluate(()=>{const el=document.querySelector('#nonStopEnabled');el.checked=false;el.dispatchEvent(new Event('change'));});await p.close();
 const next=await c.newPage();await next.goto(url);await next.waitForFunction(()=>!document.querySelector('#editFullscreenShortcut').disabled);assert.equal(await next.locator('#nonStopEnabled').isChecked(),false);
 assert.deepEqual(errors,[]);console.log('PASS: 20 popup lifecycles, 80 rapid setting changes, shortcut Disable/Reset, save immediately before close, no page errors.');
}finally{await c.close();}
