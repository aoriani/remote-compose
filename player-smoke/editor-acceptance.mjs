import {spawn,execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,writeFile,readFile,cp,rm,stat,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {runEditor} from './full-editor.mjs';
import {runLifecycle} from './editor-lifecycle.mjs';

const root=resolve(import.meta.dirname,'..');
const folder=resolve(process.env.EDITOR_REPORT_DIR||'artifacts/editor-acceptance',new Date().toISOString().replaceAll(':','-'));
await mkdir(folder,{recursive:true});
const data=await mkdtemp(resolve(folder,'documents-'));
const startedAt=Date.now();
const report={revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),folder,scope:'Actual editor/browser/backend acceptance; no native device rerun',stages:[],errors:[]};
const server=spawn(resolve(root,'pipeline/build/install/pipeline/bin/pipeline'),['serve','0',data],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
let logs='',base;server.stderr.on('data',d=>logs+=d);server.stdout.on('data',d=>logs+=d);
const bindings='samples/full-retail-run.json';let priorBinding;try{priorBinding=await readFile(bindings);}catch{}
async function copyFresh(from,to){
 await mkdir(to,{recursive:true});
 for(const entry of await readdir(from,{withFileTypes:true})){
  if(!entry.isFile())continue;
  const path=resolve(from,entry.name);
  if((await stat(path)).mtimeMs>=startedAt)await cp(path,resolve(to,entry.name));
 }
}
async function stage(name,fn){const started=Date.now();try{await fn();report.stages.push({name,passed:true,seconds:(Date.now()-started)/1000});console.log('PASS',name);}catch(e){report.stages.push({name,passed:false,error:String(e)});report.errors.push(name+': '+e);console.error('FAIL',name,e);}
 await writeFile(resolve(folder,'run.json'),JSON.stringify(report,null,2));}
async function subprocess(file,extraEnv={},args=[]){
 const result=await new Promise((done,reject)=>{const p=spawn(process.execPath,[file,...args],{cwd:root,env:{...process.env,RC_TEST_URL:base,FULL_BASE:base,FULL_REPORT_DIR:resolve(folder,'usability'),...extraEnv},stdio:['ignore','pipe','pipe']});let output='';p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);p.on('error',reject);p.on('exit',code=>done({code,output}));});
 await writeFile(resolve(folder,file.split('/').at(-1)+'.log'),result.output);if(result.code!==0)throw Error(file+' exited '+result.code+'; see its log');
}
try{
 base=await new Promise((ok,no)=>{const t=setTimeout(()=>no(Error('Backend timeout '+logs)),15000);server.stdout.on('data',x=>{const m=x.toString().match(/http:\/\/127.0.0.1:\d+/);if(m){clearTimeout(t);ok(m[0]);}});server.once('exit',()=>{clearTimeout(t);no(Error('Backend exited '+logs));});});
 report.backend=base;
 await stage('every template/property and primitive gallery',async()=>{report.cases=await runEditor(base,resolve(folder,'gallery'));await writeFile(resolve(folder,'gallery/run.json'),JSON.stringify({cases:report.cases},null,2));});
 await stage('reviewed browser screenshot baselines',async()=>{await subprocess('scripts/check-visual-baseline.mjs',{BASELINE_PLATFORMS:'browser'},[resolve(folder,'gallery'),'docs/evidence/editor-acceptance/baseline']);});
 await stage('draft/export/errors/publication/races',async()=>{report.lifecycle=await runLifecycle(base,resolve(folder,'lifecycle'));});
 await stage('custom subtree preservation',async()=>{await subprocess('player-smoke/custom-preservation.mjs',{FULL_REPORT_DIR:resolve(folder,'custom-preservation')});});
 await stage('scroll/touch/zoom/responsive/keyboard',async()=>{await subprocess('player-smoke/validation-usability.mjs');});
 await stage('default/reset/migration',async()=>{await subprocess('player-smoke/default-design.mjs');await copyFresh('artifacts/default-design',resolve(folder,'default-design'));});
 await stage('full retail interactions and publish',async()=>{await subprocess('player-smoke/full-retail.mjs');await copyFresh('artifacts/full-retail',resolve(folder,'full-retail'));});
 await mkdir('artifacts/interactive',{recursive:true});
 await stage('carousel configuration and deterministic frames',async()=>{await subprocess('player-smoke/carousel-editor.mjs');});
 await stage('raw JSON interactive lifecycle',async()=>{await subprocess('player-smoke/interactive-smoke.mjs');});
 await stage('local state/rapid controls/no interaction HTTP',async()=>{await subprocess('player-smoke/interactive-stress.mjs');});
 await copyFresh('artifacts/interactive',resolve(folder,'interactive'));
}finally{
 server.kill();await writeFile(resolve(folder,'backend.log'),logs);
 if(priorBinding)await writeFile(bindings,priorBinding);else await rm(bindings,{force:true});
 await writeFile(resolve(folder,'run.json'),JSON.stringify(report,null,2));
 await mkdir('artifacts/editor-acceptance',{recursive:true});await writeFile('artifacts/editor-acceptance/latest.json',JSON.stringify({folder},null,2));
}
console.log(JSON.stringify({folder,stages:report.stages,errors:report.errors},null,2));
if(report.errors.length)process.exitCode=1;
