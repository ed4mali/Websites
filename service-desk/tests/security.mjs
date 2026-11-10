import {readFileSync} from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
const state={user:null,member:null,tickets:[],batches:[]};
const env={UBERNYX_OWNER_EMAIL:'owner@example.test',DB:{prepare(sql){return {bind(...args){this.args=args;return this},async first(){if(sql.includes('members'))return state.member;if(sql.includes('tickets')){const t=state.tickets.find(t=>t.id===this.args[0]);return t?{data:JSON.stringify(t)}:null}return null},async all(){if(sql.includes('tickets'))return {results:state.tickets.map(t=>({data:JSON.stringify(t)}))};return {results:[]}}}},async batch(statements){state.batches.push(statements);return statements.map(()=>({meta:{changes:1}}))}}};
globalThis.__env=env;globalThis.__user=()=>state.user;
async function moduleAt(file,imports){let src=readFileSync(file,'utf8');src=src.replace(/^import .*;\s*$/gm,'');src=imports+'\n'+src;return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'))}
const access=await moduleAt('app/access.ts','const env=globalThis.__env;const getChatGPTUser=globalThis.__user;');globalThis.__access=access;
const tickets=await moduleAt('app/api/tickets/route.ts','const env=globalThis.__env;const {actor,canRead,auditStatement,sameOrigin}=globalThis.__access;');
const admin=await moduleAt('app/api/admin/route.ts','const env=globalThis.__env;const {actor,auditStatement,sameOrigin}=globalThis.__access;');
const user=(id,email)=>({userId:id,email,displayName:email});
const req=(body,origin='https://desk.test')=>new Request('https://desk.test/api/tickets',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
const valid={title:'Printer offline',requester:'someone@example.test',type:'Incident',status:'New',priority:3,assignee:'Unassigned'};
assert.equal(await access.actor(),null);
for(const route of [tickets,admin]){assert.equal((await route.GET()).status,401);assert.equal((await route.POST(req(valid))).status,401)}
state.user=user('u1','unknown@example.test');assert.equal((await access.actor()).role,'pending');assert.equal((await tickets.GET()).status,403);assert.equal((await admin.GET()).status,403);
state.member={role:'admin',active:'false',groups:'[]'};assert.equal((await access.actor()).role,'pending');
state.member={role:'requester',active:'true',groups:'[]'};assert.equal((await admin.GET()).status,403);assert.equal((await admin.POST(req({kind:'group',name:'Forbidden'}))).status,403);
state.tickets=[{id:'own',createdBy:'u1'},{id:'other',createdBy:'u2'},{id:'legacy'}];assert.deepEqual((await (await tickets.GET()).json()).map(t=>t.id),['own']);
assert.equal((await tickets.POST(req({...valid,id:'other'}))).status,403);assert.equal((await tickets.POST(req({...valid,id:'own'}))).status,403);
assert.equal((await tickets.POST(req(valid,'https://evil.test'))).status,403);
let r=await tickets.POST(req({...valid,assignee:'attacker@example.test',groupId:'fake'}));assert.equal(r.status,200);let t=await r.json();assert.equal(t.requester,'unknown@example.test');assert.equal(t.assignee,'Unassigned');assert.equal(t.groupId,'');assert.equal(t.createdBy,'u1');assert.equal(state.batches.at(-1).length,2);
state.member={role:'technician',active:'true',groups:'[]'};assert.equal((await (await tickets.GET()).json()).length,3);assert.equal((await admin.GET()).status,403);
state.tickets=[{...valid,id:'ticket',version:2,history:[]}];assert.equal((await tickets.POST(req({...valid,id:'ticket',version:1}))).status,409);
assert.equal((await tickets.POST(req({...valid,priority:0}))).status,400);
state.user=user('owner','owner@example.test');state.member=null;assert.equal((await access.actor()).role,'admin');assert.equal((await admin.GET()).status,200);assert.equal((await admin.POST(req({kind:'member',email:'owner@example.test',role:'requester'}))).status,400);assert.equal((await admin.POST(req({kind:'member',email:'bad',role:'admin'}))).status,400);assert.equal((await admin.POST(req({kind:'group',name:'Service desk'}))).status,200);assert.equal(state.batches.at(-1).length,2);
assert.equal(access.canRead({role:'requester',userId:'u1'},{createdBy:'u2'}),false);
console.log('Security checks passed: anonymous and pending denial, inactive users, requester isolation, technician permissions, owner protection, cross-origin denial, validation, audit batches, stale update conflicts.');
