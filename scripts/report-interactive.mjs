import {readFile,writeFile,readdir,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {resolve} from 'node:path';
const folder='artifacts/interactive',result=process.argv[2];
if(!result)throw Error('Pass the completed interactive XCTest .xcresult path');
const browser=JSON.parse(await readFile(`${folder}/browser-proof.json`,'utf8'));
const records=browser.records.map(({id,version,sha256,bytes})=>({id,version,sha256,bytes}));
for(const r of records){const b=await readFile(`${folder}/${r.id}.rc`);if(b.length!==r.bytes||createHash('sha256').update(b).digest('hex')!==r.sha256)throw Error('Saved browser bytes do not match publication');}
const summary=JSON.parse(execFileSync('xcrun',['xcresulttool','get','test-results','summary','--path',result],{encoding:'utf8'}));
if(summary.failedTests!==0||summary.passedTests!==2)throw Error('Expected both native interaction and visible-state iOS methods to pass');
const xmlDir='android-player/build/outputs/androidTest-results/connected/debug';
let androidTests=0;for(const p of await readdir(xmlDir)){if(p.endsWith('.xml')){const xml=await readFile(`${xmlDir}/${p}`,'utf8'),root=xml.match(/<testsuite\b[^>]+>/)?.[0]||'';if(!/failures="0"/.test(root))throw Error('Android test failures');androidTests+=Number(root.match(/tests="(\d+)"/)?.[1]||0);}}
if(androidTests!==5)throw Error('Expected all five Android tests');
const lock=JSON.parse(await readFile('upstream-lock.json','utf8'));
const appHashes={};for(const [platform,path] of Object.entries({android:'android-player/build/outputs/apk/debug/android-player-debug.apk',ios:'ios-player/build/RemoteCompose.app/RemoteCompose'}))appHashes[platform]=createHash('sha256').update(await readFile(path)).digest('hex');
const report={createdAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),upstreams:{androidx:lock.androidx.revision,experiments:lock.experiments.revision},records,browser:{errors:browser.errors,events:browser.events,rawLifecycle:browser.rawLifecycle},editor:JSON.parse(await readFile(`${folder}/editor-config.json`,'utf8')),stress:JSON.parse(await readFile(`${folder}/stress-proof.json`,'utf8')),nestedActionName:JSON.parse(await readFile(`${folder}/resource-repro.json`,'utf8')),native:{androidTests,iosPassedTests:summary.passedTests,iosFailedTests:summary.failedTests,resultBundle:result,appHashes,installation:'One installed app per platform consumes all three versions; no per-document client build'},limitations:['session-only state','2–5 inspector slides; explicit namespaces for additional carousels','different native font metrics','no general function/conditional conformance claim','no physical-device or accessibility certification','browser deterministic frames; native live clocks not synchronized']};
await writeFile(`${folder}/report.json`,JSON.stringify(report,null,2)+'\n');
console.log('Interactive validation report:',resolve(`${folder}/report.json`));
