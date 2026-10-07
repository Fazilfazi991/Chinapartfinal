import {userClient,ingestionClient} from '../../../../../../lib/supabase/server';
import {cataloguePhotosReady} from '../../../../../../lib/config.mjs';
import {cataloguePhotoResponse} from '../../../../../../lib/catalogue-photo.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 if(!cataloguePhotosReady())return Response.json({error:'Photo unavailable.'},{status:404,headers:{'Cache-Control':'private, no-store'}});
 try{return await cataloguePhotoResponse(await userClient(),ingestionClient,(await params).id,{staff:true});}catch{return Response.json({error:'Photo unavailable.'},{status:503,headers:{'Cache-Control':'private, no-store'}});}
}
