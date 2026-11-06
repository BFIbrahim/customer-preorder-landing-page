import {initAuth} from '../node_modules/@google/clasp/build/src/auth/auth.js';
import fs from 'node:fs';
const {credentials:auth}=await initAuth({});
const config=JSON.parse(fs.readFileSync('.clasp.json','utf8'));
const action=process.argv[2];
try{
 if(action==='deployments'){
  const r=await auth.request({url:`https://script.googleapis.com/v1/projects/${config.scriptId}/deployments`});
  console.log(JSON.stringify(r.data,null,2));
 }else if(action==='sheets'){
  const r=await auth.request({url:'https://www.googleapis.com/drive/v3/files',params:{q:"trashed=false and mimeType='application/vnd.google-apps.spreadsheet' and name='ZOCS Lifestyle Pre-orders'",fields:'files(id,name,webViewLink,createdTime)',pageSize:100}});
  console.log(JSON.stringify(r.data,null,2));
 }else throw Error('Unknown action');
}catch(e){console.error(JSON.stringify({status:e.response?.status,error:e.response?.data?.error?.message||e.message}));process.exitCode=1;}
