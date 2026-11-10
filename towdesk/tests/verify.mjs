import ts from 'typescript';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {z} from 'zod';
import assert from 'node:assert/strict';
function code(path){return ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^import .*;\n/gm,'').replaceAll('export async function','async function').replaceAll('export function','function').replaceAll('export const','const').replace(/export \{\};?/g,'');}
const domain=new Function(code('lib/domain.ts')+';return {totals,normalize,newJob,storageDays,csv};')();
const {totals,normalize,newJob,storageDays}=domain;
const recordSchema=new Function('z',code('lib/validation.ts')+';return recordSchema;')(z);
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8').replaceAll('--> statement-breakpoint',''));
const DB={prepare(q){return {bind(...args){const stmt=sql.prepare(q);return {async all(){return {results:stmt.all(...args)}},async first(){return stmt.get(...args)||null},async run(){return {meta:{changes:stmt.run(...args).changes}}}}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const st of statements)out.push(await st.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const api=new Function('env','recordSchema','normalize','totals',code('app/api/records/route.ts')+';return {GET,POST};')({DB},recordSchema,normalize,totals);
async function call(method,data,user='owner-a',origin='https://test.local'){const headers={'content-type':'application/json',origin};if(user)headers['oai-authenticated-user-id']=user;const res=await api[method](new Request('https://test.local/api/records',{method,headers,...(data?{body:JSON.stringify(data)}:{})}));return {status:res.status,data:await res.json()}}
async function saved(data,user){const r=await call('POST',data,user);assert.equal(r.status,200,JSON.stringify(r));return r.data}
const legacy=normalize({kind:'job',name:'Old',amount:185,paid:true});assert.equal(totals(legacy).balance,0);assert.equal(legacy.items[0].rate,185);assert.equal(legacy.payments[0].amount,185);
assert.deepEqual(totals({items:[{qty:2,rate:50.25}],discount:10,taxRate:8,payments:[{amount:50}]}),{subtotal:100.5,discount:10,tax:7.24,total:97.74,paid:50,balance:47.74});assert.equal(storageDays('2026-10-25','2026-10-27'),3);
const truck=await saved({kind:'truck',name:'Unit 1',status:'Available',truckType:'Flatbed'});const driver=await saved({kind:'driver',name:'Driver',active:true,truckId:truck.id});const customer=await saved({kind:'customer',name:'Customer'});
let job=await saved({...newJob(),name:'Test job',pickup:'Test street',customerId:customer.id,driver:driver.id,truckId:truck.id});assert.match(job.number,/^TD-/);assert.equal(job.items[0].rate,150);
assert.equal((await call('GET',null,'owner-b')).data.length,0);assert.equal((await call('GET',null,'')).status,401);assert.equal((await call('POST',{...job,name:'Other'},'owner-b')).status,404);assert.equal((await call('POST',job,'owner-a','https://evil.test')).status,403);
const original=job;job=await saved({...job,status:'Completed',payments:[{id:'p1',amount:50,date:'2026-10-27',method:'Cash',reference:''}]});assert.equal(totals(job).balance,100);assert.equal((await call('POST',original)).status,409);
assert.equal((await call('POST',{...job,payments:[{id:'p2',amount:200,date:'2026-10-27',method:'Cash',reference:''}]})).status,400);assert.equal((await call('POST',{...job,discount:200})).status,400);
assert.equal((await call('POST',{...job,service:'Impound',impound:{status:'Released',intake:'2026-10-27',release:'2026-10-26',releasedTo:'Customer'}})).status,400);
const foreignDriver=await saved({kind:'driver',name:'Other driver',active:true},'owner-b');assert.equal((await call('POST',{...job,driver:foreignDriver.id})).status,400);
job=await saved({...job,archived:true});assert.equal(job.archived,true);job=await saved({...job,archived:false});assert.equal(job.archived,false);
const audit=sql.prepare('SELECT summary FROM events WHERE record_id=?').all(job.id);assert.equal(audit.length,4);assert(audit.some(a=>a.summary.includes('New → Completed')));assert(audit.some(a=>a.summary.startsWith('Archived')));
await saved({kind:'settings',name:'Company'});assert.equal((await call('POST',{kind:'settings',name:'Duplicate'})).status,409);
assert(recordSchema.safeParse({...newJob(),name:'Valid',pickup:'Address'}).success);assert(!recordSchema.safeParse({...newJob(),name:'Valid',pickup:'Address',items:[{id:'bad',description:'x',qty:0,rate:1}]}).success);
console.log('PASS: legacy migration, cents-based totals, partial payments, storage days, CRUD, references, owner isolation, CSRF, stale writes, archive/restore, audit history, duplicate settings, validation.');
const objects=new Map();const BUCKET={async put(k,b){objects.set(k,b)},async get(k){const b=objects.get(k);return b?{body:b}:null},async delete(k){objects.delete(k)}};
const filesApi=new Function('env',code('app/api/files/route.ts')+';return {POST};')({DB,BUCKET});
const fileGet=new Function('env',code('app/api/files/[id]/route.ts')+';return GET;')({DB,BUCKET});
async function upload(type,bytes,owner='owner-a'){const form=new FormData();form.set('jobId',job.id);form.set('file',new File([new Uint8Array(bytes)],'test.jpg',{type}));return filesApi.POST(new Request('https://test.local/api/files',{method:'POST',headers:{origin:'https://test.local','oai-authenticated-user-id':owner},body:form}))}
let uploadResult=await upload('image/jpeg',[255,216,255,217]);assert.equal(uploadResult.status,200);const file=await uploadResult.json();let got=await fileGet(new Request('https://test.local/api/files/'+file.id,{headers:{'oai-authenticated-user-id':'owner-a'}}),{params:Promise.resolve({id:file.id})});assert.equal(got.status,200);assert.equal(got.headers.get('X-Content-Type-Options'),'nosniff');assert.equal((await got.arrayBuffer()).byteLength,4);
got=await fileGet(new Request('https://test.local/api/files/'+file.id,{headers:{'oai-authenticated-user-id':'owner-b'}}),{params:Promise.resolve({id:file.id})});assert.equal(got.status,404);assert.equal((await upload('image/jpeg',[1,2,3])).status,400);assert.equal((await upload('text/html',[1,2,3])).status,400);assert.equal((await upload('image/jpeg',[255,216],'owner-b')).status,404);console.log('PASS: authenticated attachment upload/download, foreign-owner rejection, signature/type validation.');
