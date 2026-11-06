import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const port=9336;
const proc=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(os.tmpdir(),'zocs-integration-browser')}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let tab;
try{
 for(let i=0;i<60;i++){try{tab=await fetch(`http://127.0.0.1:${port}/json/new?http://127.0.0.1:8080`,{method:'PUT'}).then(r=>r.json());if(tab.webSocketDebuggerUrl)break;}catch{}await pause(500);}
 if(!tab?.webSocketDebuggerUrl)throw Error('Browser debugging unavailable');
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let id=0;const calls=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const c=calls.get(m.id);if(c){calls.delete(m.id);m.error?c.reject(Error(m.error.message)):c.resolve(m.result);}}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;calls.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 for(let i=0;i<60;i++){if(await evaluate('typeof form !== "undefined" && typeof pending !== "undefined"'))break;await pause(500);}
 const orders=JSON.parse(fs.readFileSync('.local/live-test-orders.json','utf8'));const results=[];
 for(const o of orders){
  const result=await evaluate(`(async()=>{const o=${JSON.stringify(o)};document.getElementById('customerName').value=o.name;document.getElementById('customerPhone').value=o.phone;document.getElementById('customerAddress').value=o.address;document.querySelectorAll('[name="products"]').forEach(x=>x.checked=JSON.parse(o.products).includes(x.value));pending={fingerprint:JSON.stringify({name:o.name,phone:o.phone,address:o.address,products:o.products,website:o.website}),id:o.submissionId};form.dispatchEvent(new Event('submit',{cancelable:true}));for(let i=0;i<160&&button.disabled;i++)await new Promise(r=>setTimeout(r,250));return {products:o.products,message:message.textContent,success:message.className.includes('text-green-800'),buttonEnabled:!button.disabled};})()`);
  results.push(result);
 }
 console.log(JSON.stringify(results,null,2));fs.writeFileSync('.local/browser-test-results.json',JSON.stringify(results,null,2));
 if(results.some(x=>!x.success||!x.buttonEnabled))process.exitCode=1;
 const failure=await evaluate(`(async()=>{const savedFetch=window.fetch;window.fetch=async()=>{throw Error('Simulated offline test')};document.getElementById('customerName').value='ZOCS TEST FAILURE';document.getElementById('customerPhone').value='01700000000';document.getElementById('customerAddress').value='TEST ADDRESS, DHAKA';document.getElementById('product1').checked=true;form.dispatchEvent(new Event('submit',{cancelable:true}));for(let i=0;i<40&&button.disabled;i++)await new Promise(r=>setTimeout(r,100));window.fetch=savedFetch;return {showsError:message.className.includes('text-red-700'),preservesForm:document.getElementById('customerName').value==='ZOCS TEST FAILURE',buttonEnabled:!button.disabled};})()`);console.log(JSON.stringify({simulatedBrowserFailure:failure}));if(!failure.showsError||!failure.preservesForm||!failure.buttonEnabled)process.exitCode=1;
 await send('Browser.close');ws.close();
}catch(e){console.error(e.message);process.exitCode=1;proc.kill();}
