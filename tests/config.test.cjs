const {test}=require('node:test');const assert=require('node:assert/strict');
const {publicConfig}=require('../scripts/build-config.cjs');
test('browser config exports only the public endpoint, never private environment values',()=>{
 const result=publicConfig({PUBLIC_APPS_SCRIPT_URL:'https://script.google.com/macros/s/example/exec',GOOGLE_SPREADSHEET_ID:'private-sheet',GOOGLE_APPS_SCRIPT_ID:'private-script',GOOGLE_DEPLOYMENT_ID:'private-deployment',GOOGLE_TOKEN:'secret-token'});
 assert.deepEqual(result,{endpoint:'https://script.google.com/macros/s/example/exec'});assert.doesNotMatch(JSON.stringify(result),/private-|secret-token/);
});
test('build rejects missing, untrusted and injected endpoint values',()=>{for(const value of ['',undefined,'https://evil.example/exec','https://script.google.com/macros/s/example/exec?token=secret','https://script.google.com/macros/s/example/exec\";alert(1)'])assert.throws(()=>publicConfig({PUBLIC_APPS_SCRIPT_URL:value}));});
