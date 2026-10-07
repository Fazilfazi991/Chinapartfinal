import {publicContentClient} from '../../../../../lib/public-content';
import {ingestionClient} from '../../../../../lib/supabase/server';
import {cataloguePhotosReady} from '../../../../../lib/config.mjs';
import {cataloguePhotoResponse} from '../../../../../lib/catalogue-photo.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const reader=publicContentClient();if(!reader||!cataloguePhotosReady()||process.env.CPS_PUBLIC_CATALOGUE_ENABLED!=='true')return Response.json({error:'Photo unavailable.'},{status:404,headers:{'Cache-Control':'private, no-store'}});
 return cataloguePhotoResponse(reader,ingestionClient,(await params).id);
}
