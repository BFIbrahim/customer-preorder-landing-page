'use strict';
const fs=require('node:fs');const {buildConfig}=require('./build-config.cjs');
const [kind,value]=process.argv.slice(2);
if(kind==='endpoint'){
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(value||''))throw Error('Provide a real deployed Apps Script /exec URL');
 const current=fs.existsSync('.env')?fs.readFileSync('.env','utf8'):'';
 const setting='PUBLIC_APPS_SCRIPT_URL='+value;
 fs.writeFileSync('.env',/^PUBLIC_APPS_SCRIPT_URL=.*$/m.test(current)?current.replace(/^PUBLIC_APPS_SCRIPT_URL=.*$/m,setting):current+'\n'+setting+'\n');
 process.env.PUBLIC_APPS_SCRIPT_URL=value;buildConfig();
}else if(kind==='firebase'){
 if(!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value||''))throw Error('Provide the selected real Firebase project ID');
 fs.writeFileSync('.firebaserc',JSON.stringify({projects:{default:value}},null,2));
}else throw Error('Usage: node scripts/configure.cjs endpoint|firebase REAL_VALUE');
