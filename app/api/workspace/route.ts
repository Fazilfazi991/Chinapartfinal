import {NextResponse} from 'next/server';
import {userClient,authConfigured,ingestionClient} from '../../../lib/supabase/server';
import {readWorkspaceResource,readWorkspaceSnapshot,readWorkspaceSelector,WorkspaceAccessError} from '../../../lib/workspace-reader.mjs';
import {normalizeWorkspaceSnapshot} from '../../../lib/workspace-snapshot.mjs';
import {customerAuthEnabled} from '../../../lib/customer-auth.mjs';
import {documentPolicy} from '../../../lib/document-policy.mjs';
import {readWorkspaceAdministration} from '../../../lib/workspace-administration.mjs';
import {writeWorkspaceCommand} from '../../../lib/workspace-writer.mjs';
import {workspaceWritesReady,workspaceOriginAllowed} from '../../../lib/config.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
export async function GET(request:Request){
  if(process.env.CPS_WORKSPACE_READS_ENABLED!=='true'||!authConfigured())return NextResponse.json({error:'Live customer and commercial workspace is not activated.'},{status:503,headers});
  try{
    const query=new URL(request.url).searchParams;
    const mode=query.get('mode');if(mode!=='staff'&&mode!=='customer')throw new WorkspaceAccessError('Workspace unavailable.',404);
    if(mode==='customer'&&!customerAuthEnabled())throw new WorkspaceAccessError('Customer workspace is not activated.',503);
    if(query.get('resource')==='administration'){if(mode!=='staff')throw new WorkspaceAccessError('Resource unavailable.',404);return NextResponse.json(await readWorkspaceAdministration(await userClient(),ingestionClient,Number(query.get('page')??0)),{headers});}
    if(query.get('resource')==='selector')return NextResponse.json(await readWorkspaceSelector(await userClient(),ingestionClient,mode,query.get('kind')??'',Number(query.get('page')??0),query.get('id')),{headers});
    if(query.get('resource')==='snapshot')return NextResponse.json(normalizeWorkspaceSnapshot(await readWorkspaceSnapshot(await userClient(),mode,{focus:query.get('focus'),page:Number(query.get('page')??0),id:query.get('id'),children:Object.fromEntries(['comments','tracking','replies'].filter(key=>query.has(key+'Page')).map(key=>[key,Number(query.get(key+'Page'))]))}),{writes:workspaceWritesReady(),publication:process.env.CPS_PUBLICATION_ENABLED==='true',linking:process.env.CPS_RFQ_LINKING_ENABLED==='true',documents:documentPolicy()}),{headers});
    const page=Number(query.get('page')??'0');
    return NextResponse.json(await readWorkspaceResource(await userClient(),mode,query.get('resource')??'',page,{ids:query.has('id')?[query.get('id')!]:null}),{headers});
  }catch(error){return NextResponse.json({error:error instanceof WorkspaceAccessError?error.message:'Workspace data is unavailable.'},{status:error instanceof WorkspaceAccessError?error.status:503,headers});}
}
export async function POST(request:Request){
 if(!workspaceWritesReady())return NextResponse.json({error:'Live commercial writes and issuance are not activated.'},{status:503,headers});
 try{
  if(!workspaceOriginAllowed(request))throw new WorkspaceAccessError('Request origin rejected.',403);
  const mode=new URL(request.url).searchParams.get('mode');if(mode!=='staff'&&mode!=='customer')throw new WorkspaceAccessError('Workspace unavailable.',404);
  if(mode==='customer'&&!customerAuthEnabled())throw new WorkspaceAccessError('Customer workspace is not activated.',503);
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new WorkspaceAccessError('Use a JSON request.',415);
  const reader=request.body?.getReader();if(!reader)throw new WorkspaceAccessError('A request body is required.',400);
  const chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();throw new WorkspaceAccessError('Workspace request exceeds 64 KB.',413);}chunks.push(value);}}finally{reader.releaseLock();}
  let command;try{command=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new WorkspaceAccessError('Invalid JSON.',400);}
  return NextResponse.json(await writeWorkspaceCommand(await userClient(),ingestionClient,mode,command,{publication:process.env.CPS_PUBLICATION_ENABLED==='true',linking:process.env.CPS_RFQ_LINKING_ENABLED==='true',documents:documentPolicy()}),{headers});
 }catch(error){return NextResponse.json({error:error instanceof WorkspaceAccessError?error.message:'Workspace save is unavailable. No success was confirmed.'},{status:error instanceof WorkspaceAccessError?error.status:503,headers});}
}
