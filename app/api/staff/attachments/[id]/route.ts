import {authConfigured,userClient,ingestionClient} from '../../../../../lib/supabase/server';
import {privateDownload} from '../../../../../lib/private-download.mjs';
import {persistenceReady} from '../../../../../lib/config.mjs';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!authConfigured()||!persistenceReady())return Response.json({error:'Staff access is not configured.'},{status:503});
  if(!/^[a-f0-9-]{36}$/i.test(id))return Response.json({error:'Attachment not found.'},{status:404});
  return privateDownload(await userClient(),ingestionClient,id);
}
