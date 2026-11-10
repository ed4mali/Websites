import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
export async function actor(){const u=await getChatGPTUser();if(!u)return null;const owner=String((env as any).UBERNYX_OWNER_EMAIL||'').toLowerCase();if(owner&&u.email.toLowerCase()===owner)return {...u,role:'admin',groups:[],owner:true};const m:any=await env.DB!.prepare('SELECT * FROM members WHERE email=?').bind(u.email.toLowerCase()).first();if(!m||m.active!=='true')return {...u,role:'pending',groups:[],owner:false};return {...u,role:m.role,groups:JSON.parse(m.groups),owner:false};}
export function canRead(a:any,t:any){return ['admin','technician'].includes(a.role)||(a.role==='requester'&&t.createdBy===a.userId)}
export function auditStatement(a:any,action:string,target:string,details:any){return env.DB!.prepare('INSERT INTO audit(id,date,actor,action,target,details) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),new Date().toISOString(),a.email,action,target,JSON.stringify(details));}
export function sameOrigin(req:Request){return !req.headers.get('origin')||req.headers.get('origin')===new URL(req.url).origin;}
