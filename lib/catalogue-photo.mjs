import {createHash,randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {verifiedWorkspaceIdentity,WorkspaceAccessError} from './workspace-reader.mjs';
const fail=(message,status=400)=>{throw new WorkspaceAccessError(message,status)};
const id=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)?value.toLowerCase():fail('Use valid product and operation IDs.');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const maximum=1048576;
const signature=(bytes,type)=>type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
export function photoCommand(command){
 if(!command||typeof command!=='object'||!['catalogue.photo.upload','catalogue.photo.remove'].includes(command.type))fail('Unsupported photo operation.');
 const input=command.input;if(!input||typeof input!=='object'||Array.isArray(input))fail('Check the photo fields.');
 const canonical={key:id(command.key),type:command.type,productId:id(input.id),version:input.version};
 if(!Number.isSafeInteger(canonical.version)||canonical.version<0||canonical.version>2147483646)fail('Check the product version.');
 if(command.type==='catalogue.photo.upload'){
  const alt=typeof input.alt==='string'?input.alt.trim():'';if(!alt||alt.length>200||/[\x00-\x1f]/.test(alt))fail('Describe the photo in 1–200 characters.');
  const file=input.file;if(!file||!['image/png','image/jpeg'].includes(file.type)||typeof file.content!=='string'||file.content.length>1398104||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content))fail('Use a PNG or JPEG photo no larger than 1 MB.');
  const bytes=Buffer.from(file.content,'base64');if(!bytes.length||bytes.length>maximum||file.size!==bytes.length)fail('Use a photo no larger than 1 MB.',413);
  if(!signature(bytes,file.type))fail('The file signature does not match PNG/JPEG.');
  canonical.alt=alt;canonical.typeHint=file.type;canonical.sourceSha=hash(bytes);canonical.bytes=bytes;
 }
 const digest=hash(JSON.stringify({...canonical,bytes:undefined}));return {...canonical,digest};
}
export async function normalizeCataloguePhoto(bytes,type){
 try{
  if(bytes.length>maximum||!signature(Buffer.from(bytes),type))fail('Use a PNG/JPEG photo no larger than 1 MB.');
  const decoder=sharp(bytes,{limitInputPixels:16777216,failOn:'error',animated:false});const meta=await decoder.metadata();
  if(meta.format!==(type==='image/jpeg'?'jpeg':'png')||!meta.width||!meta.height||meta.width>4096||meta.height>4096||(meta.pages??1)>1)fail('Use a single PNG/JPEG photo up to 4096 pixels per side.');
  // Re-encode actual pixels, stripping metadata and arbitrary source payloads.
  const {data,info}=await decoder.rotate().png({compressionLevel:6}).toBuffer({resolveWithObject:true});
  if(data.length>maximum)fail('The safe image exceeds 1 MB. Compress it and retry.',413);
  return {bytes:data,sha256:hash(data),size:data.length,width:info.width,height:info.height,type:'image/png',content:data.toString('base64')};
 }catch(error){if(error instanceof WorkspaceAccessError)throw error;fail('The photo could not be decoded safely.');}
}
const rpcError=error=>{if(!error)return;const errors={workspace_access:['Administrator access required.',403],record_unavailable:['Product unavailable.',404],version_conflict:['This product changed. Reload before saving.',409],operation_conflict:['This operation key belongs to different data.',409],draft_archived:['Restore the catalogue entry before editing.',409],invalid_command:['Check the photo fields.',400]};const [message,status]=errors[error.message]??['Photo storage is unavailable. No success was confirmed.',503];fail(message,status);};
export async function writeCataloguePhoto(userClient,serviceFactory,command,{enabled=false,scanner=null}={}){
 if(!enabled)fail('Catalogue photos are not activated.',503);
 const actor=await verifiedWorkspaceIdentity(userClient,'staff');if(actor.role!=='admin')fail('Administrator access required.',403);
 const c=photoCommand(command),service=serviceFactory();
 const receipt=await service.rpc('cps_catalogue_photo_receipt',{p_actor:actor.userId,p_key:c.key,p_digest:c.digest});rpcError(receipt.error);
 if(receipt.data){if(receipt.data.id!==c.productId||!Number.isSafeInteger(receipt.data.version))fail('Photo storage returned no valid acknowledgement.',503);return receipt.data;}
 const current=await userClient.from('cps_catalogue').select('id,version,archived').eq('id',c.productId).maybeSingle();
 if(current.error)fail('The catalogue is temporarily unavailable.',503);if(!current.data)fail('Product unavailable.',404);if(current.data.version!==c.version)fail('This product changed. Reload before saving.',409);if(current.data.archived)fail('Restore the catalogue entry before editing.',409);
 let photo=null;
 if(c.type==='catalogue.photo.upload'){
  const image=await normalizeCataloguePhoto(c.bytes,c.typeHint);if(!scanner)fail('Photo scanning is not configured.',503);
  let attestation;try{attestation=await scanner(image);}catch{fail('The photo could not be verified by the scanner.',503);}if(attestation!==image.sha256)fail('The scanner did not verify these exact image bytes.',503);
  const objectKey=`${c.productId}/${actor.userId}/${c.key}/${image.sha256}.png`;
  const bucket=service.storage.from('cps-catalogue-private');const stored=await bucket.upload(objectKey,image.bytes,{contentType:'image/png',upsert:false});
  if(stored.error){
   if(String(stored.error.statusCode)!=='409')fail('Photo storage is unavailable. Your selected file is retained.',503);
   const existing=await bucket.download(objectKey);if(existing.error||!existing.data||hash(Buffer.from(await existing.data.arrayBuffer()))!==image.sha256)fail('The stored retry bytes could not be verified.',503);
  }
  photo={id:randomUUID(),object_key:objectKey,sha256:image.sha256,size:image.size,width:image.width,height:image.height,alt:c.alt};
 }
 const result=await service.rpc('cps_catalogue_photo_mutate',{p_actor:actor.userId,p_key:c.key,p_digest:c.digest,p_product:c.productId,p_version:c.version,p_photo:photo});rpcError(result.error);
 if(result.data?.id!==c.productId||!Number.isSafeInteger(result.data.version))fail('Photo storage returned no valid acknowledgement.',503);return result.data;
}
const responseHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'X-Robots-Tag':'noindex, nofollow'};
export async function cataloguePhotoResponse(reader,serviceFactory,productId,{staff=false}={}){
 try{
  const product=id(productId);let actor=null;
  if(staff)actor=await verifiedWorkspaceIdentity(reader,'staff');
  let query=reader.from('cps_catalogue').select('id,photo_id').eq('id',product);
  if(!staff)query=query.eq('published',true).eq('approved',true).eq('archived',false);
  const visible=await query.maybeSingle();if(visible.error||!visible.data?.photo_id)fail('Photo unavailable.',404);
  // Anonymous/user RLS authorizes before a privileged client is constructed.
  const service=serviceFactory();const meta=await service.rpc('cps_catalogue_photo_resolve',{p_product:product,p_actor:actor?.userId??null});
  if(meta.error||!meta.data||meta.data.id!==visible.data.photo_id||meta.data.scan_status!=='clean')fail('Photo unavailable.',404);
  const file=await service.storage.from('cps-catalogue-private').download(meta.data.object_key);if(file.error||!file.data)fail('Photo unavailable.',503);
  const bytes=Buffer.from(await file.data.arrayBuffer());if(bytes.length!==meta.data.size||bytes.length>maximum||hash(bytes)!==meta.data.sha256)fail('Photo unavailable.',503);
  return new Response(bytes,{headers:{...responseHeaders,'Content-Type':'image/png','Content-Disposition':'inline; filename="catalogue-photo.png"'}});
 }catch(error){return Response.json({error:error instanceof WorkspaceAccessError?error.message:'Photo unavailable.'},{status:error instanceof WorkspaceAccessError?error.status:503,headers:responseHeaders});}
}
