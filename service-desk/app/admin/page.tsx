import {requireChatGPTUser} from '../chatgpt-auth';import {actor} from '../access';import Admin from './Admin';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/admin');const a=await actor();if(a?.role!=='admin')return <main className="logincard" style={{margin:'10vh auto'}}><h1>Access denied</h1><p>Only administrators can access workspace administration.</p><a href="/desk">Back to workspace</a></main>;return <Admin/>}
