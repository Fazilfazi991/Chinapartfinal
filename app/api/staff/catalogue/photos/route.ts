import {NextResponse} from 'next/server';
import {userClient,ingestionClient} from '../../../../../lib/supabase/server';
import {cataloguePhotosReady,workspaceOriginAllowed} from '../../../../../lib/config.mjs';
import {writeCataloguePhoto} from '../../../../../lib/catalogue-photo.mjs';
import {scanFile} from '../../../../../lib/production-store.mjs';
import {WorkspaceAccessError} from '../../../../../lib/workspace-reader.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
export async function POST(request:Request){
 if(!cataloguePhotosReady())return NextResponse.json({error:'Catalogue photos are not activated.'},{status:503,headers});
 try{
  if(!workspaceOriginAllowed(request))throw new WorkspaceAccessError('Request origin rejected.',403);
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new WorkspaceAccessError('Use JSON photo fields.',415);
  const reader=request.body?.getReader();if(!reader)throw new WorkspaceAccessError('Photo fields required.',400);
  const chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();throw new WorkspaceAccessError('Photo request exceeds its limit.',413);}chunks.push(value);}}finally{reader.releaseLock();}
  let command;try{command=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new WorkspaceAccessError('Invalid JSON.',400);}
  const result=await writeCataloguePhoto(await userClient(),ingestionClient,command,{enabled:true,scanner:file=>scanFile(file,{url:process.env.CPS_SCANNER_URL!,token:process.env.CPS_SCANNER_TOKEN!})});return NextResponse.json(result,{headers});
 }catch(error){return NextResponse.json({error:error instanceof WorkspaceAccessError?error.message:'Photo storage is unavailable. No success was confirmed.'},{status:error instanceof WorkspaceAccessError?error.status:503,headers});}
}
