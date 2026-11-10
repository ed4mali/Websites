import {build} from 'esbuild';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const dir=await mkdtemp(join(tmpdir(),'towdesk-test-'));
try {
await build({stdin:{contents:"export {localFetch} from './lib/local-store'; export {newJob,defaults} from './lib/domain';",resolveDir:resolve('.')},bundle:true,platform:'node',format:'cjs',outfile:join(dir,'adapter.cjs')});
const {localFetch,newJob,defaults}=createRequire(import.meta.url)(join(dir,'adapter.cjs'));
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};globalThis.location={origin:'https://example.test'};
const post=x=>localFetch('/api/records',{method:'POST',body:JSON.stringify(x)});
assert.deepEqual(await(await localFetch('/api/records')).json(),[]);
let r=await post({kind:'customer',name:'Customer'});assert(r.ok);const c=await r.json();assert(c.revision);
r=await post({...c,name:'Updated'});assert(r.ok);assert.equal((await post(c)).status,409);
let job={...newJob(defaults),name:'Tow request',pickup:'100 Main St',customerId:c.id};r=await post(job);assert(r.ok);job=await r.json();assert(job.number.startsWith('TD-'));
assert.equal((await post({...job,driver:'missing'})).status,400);
assert.equal((await post({...job,payments:[{id:'p',amount:999999,date:'2026-11-10',method:'Cash',reference:''}]})).status,400);
assert((await post({...job,archived:true})).ok);
assert.equal((await(await localFetch('/api/records')).json()).length,2);
assert((await(await localFetch('/api/activity?record='+job.id)).json()).length>=2);
assert.equal((await post({kind:'customer',name:''})).status,400);
localStorage.setItem=()=>{throw Error('quota')};r=await post({kind:'customer',name:'Storage full'});assert.equal(r.status,400);assert.match((await r.json()).error,/storage is full/);
console.log('Static storage and workflow checks passed.');
} finally {await rm(dir,{recursive:true,force:true});}
