import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('google-deployment.json','utf8'));
try{const r=await fetch(d.webAppUrl,{method:'POST',body:new URLSearchParams({name:'',submissionId:'invalid'}),signal:AbortSignal.timeout(45000)});console.log(JSON.stringify({status:r.status,response:(await r.text()).slice(0,600)}));}catch(e){console.error(e.message);process.exitCode=1;}
