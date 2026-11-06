'use strict';
const fs=require('node:fs'),path=require('node:path');
function publicConfig(env){
 const endpoint=(env.PUBLIC_APPS_SCRIPT_URL||'').trim();
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint))throw Error('Set PUBLIC_APPS_SCRIPT_URL to your real Apps Script /exec URL in .env or the build environment.');
 // Explicit allowlist: never serialize process.env or private Google settings.
 return {endpoint};
}
function buildConfig(root=process.cwd()){
 const envPath=path.join(root,'.env');if(fs.existsSync(envPath))process.loadEnvFile(envPath);
 const config=publicConfig(process.env);
 fs.mkdirSync(path.join(root,'public/js'),{recursive:true});
 fs.writeFileSync(path.join(root,'public/js/config.js'),'// Generated public settings only. Never place credentials here.\nwindow.ZOCS_CONFIG = Object.freeze('+JSON.stringify(config)+');\n');
 console.log('Public browser configuration generated.');
}
if(require.main===module)buildConfig();
module.exports={publicConfig,buildConfig};
