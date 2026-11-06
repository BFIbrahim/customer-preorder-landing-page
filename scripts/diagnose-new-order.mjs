import fs from 'node:fs';import crypto from 'node:crypto';
const d=JSON.parse(fs.readFileSync('google-deployment.json','utf8'));
const file='.local/diagnostic-order.json';let order;
if(fs.existsSync(file))order=JSON.parse(fs.readFileSync(file));else{order={name:'ZOCS TEST CONNECTION CHECK - DO NOT FULFIL',phone:'01700000000',address:'TEST ONLY - Dhaka, Bangladesh; do not fulfil.',products:'["ZOCS Micro"]',submissionId:crypto.randomUUID(),website:''};fs.writeFileSync(file,JSON.stringify(order,null,2));}
try{const r=await fetch(d.webAppUrl,{method:'POST',body:new URLSearchParams(order),signal:AbortSignal.timeout(45000)});console.log(JSON.stringify({diagnosticName:order.name,response:await r.json()}));}catch(e){console.error(e.message);process.exitCode=1;}
