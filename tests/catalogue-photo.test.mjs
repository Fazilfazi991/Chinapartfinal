import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {randomUUID,createHash} from 'node:crypto';
import {photoCommand,normalizeCataloguePhoto,writeCataloguePhoto,cataloguePhotoResponse} from '../lib/catalogue-photo.mjs';
const product=randomUUID(),key=randomUUID(),user=randomUUID();
const png=()=>sharp({create:{width:2,height:2,channels:4,background:{r:255,g:255,b:255,alpha:1}}}).png().toBuffer();
const command=bytes=>({key,type:'catalogue.photo.upload',input:{id:product,version:0,alt:'Synthetic test image',file:{type:'image/png',size:bytes.length,content:bytes.toString('base64')}}});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const client=(role='admin',visible=true)=>({auth:{getUser:async()=>({data:{user:role==='missing'?null:{id:user}},error:null})},from(table){return {select(){return this},eq(){return this},async maybeSingle(){return {data:table==='cps_staff_members'?{active:role!=='inactive',role:role==='inactive'?'admin':role,office_id:null}:visible?{id:product,version:0,archived:false,photo_id:key}:null,error:null}}}}});
test('photo normalization strips source metadata and stores only actual decoded PNG pixels',async()=>{
 const original=await sharp({create:{width:3,height:2,channels:3,background:{r:255,g:0,b:0}}}).withMetadata({exif:{IFD0:{ImageDescription:'PRIVATE PHOTO METADATA'}}}).jpeg().toBuffer();
 const normalized=await normalizeCataloguePhoto(original,'image/jpeg');const meta=await sharp(normalized.bytes).metadata();
 assert.equal(meta.format,'png');assert.equal(meta.exif,undefined);assert.equal(meta.icc,undefined);assert.equal(normalized.bytes.includes(Buffer.from('PRIVATE PHOTO METADATA')),false);assert.equal(hash(normalized.bytes),normalized.sha256);
});
test('photo validation rejects SVG/disguised images, wrong types/base64/sizes and excessive dimensions',async()=>{
 const image=await png();const c=command(image);
 for(const file of [{...c.input.file,type:'image/svg+xml'},{...c.input.file,content:'@@@@'},{...c.input.file,size:999},{type:'image/png',size:6,content:Buffer.from('<svg/>').toString('base64')}])assert.throws(()=>photoCommand({...c,input:{...c.input,file}}));
 const tooLarge=Buffer.alloc(1048577);tooLarge.set([137,80,78,71,13,10,26,10]);assert.throws(()=>photoCommand(command(tooLarge)),error=>error.status===413);
 const wide=await sharp({create:{width:4097,height:1,channels:3,background:'white'}}).png().toBuffer();await assert.rejects(normalizeCataloguePhoto(wide,'image/png'),error=>error.status===400);
 await assert.rejects(normalizeCataloguePhoto(Buffer.from('<svg/>'),'image/png'),error=>error.status===400);
});
test('photo uploads verify fresh admin/feature before privileged storage or image processing',async()=>{
 let privileged=0;const service=()=>{privileged++;throw new Error('Unexpected service construction')};const c=command(await png());
 await assert.rejects(writeCataloguePhoto(client(),service,c),error=>error.status===503);
 for(const [role,status] of [['missing',401],['agent',403],['customer',403],['inactive',403]])await assert.rejects(writeCataloguePhoto(client(role),service,c,{enabled:true}),error=>error.status===status);
 assert.equal(privileged,0);
});
test('scanner absence/outage/wrong digest cannot upload or commit photo metadata',async()=>{
 let storage=0,mutations=0;const service=()=>({rpc:async name=>{if(name.endsWith('mutate'))mutations++;return {data:null,error:null}},storage:{from(){storage++;throw new Error('Unexpected storage')}}});const c=command(await png());
 for(const scanner of [null,async()=>{throw new Error('SCANNER SECRET https://private/object')},async()=> 'a'.repeat(64)])await assert.rejects(writeCataloguePhoto(client(),service,c,{enabled:true,scanner}),error=>error.status===503&&!error.message.includes('SECRET')&&!error.message.includes('https://'));
 assert.equal(storage,0);assert.equal(mutations,0);
});
test('private image storage failures and wrong retry bytes cannot acknowledge a save',async()=>{
 let mutations=0;const c=command(await png());const service=error=>()=>({rpc:async name=>{if(name.endsWith('mutate'))mutations++;return {data:null,error:null}},storage:{from:()=>({upload:async()=>({error}),download:async()=>({data:new Blob(['wrong bytes']),error:null})})}});
 for(const error of [{statusCode:500,message:'PRIVATE URL'}, {statusCode:409}])await assert.rejects(writeCataloguePhoto(client(),service(error),c,{enabled:true,scanner:async image=>image.sha256}),error=>error.status===503&&!error.message.includes('URL'));
 assert.equal(mutations,0);
});
test('public photo denial constructs no service; bytes are hash/size checked with no URL leakage',async()=>{
 let privileged=0;const service=()=>{privileged++;return {rpc:async()=>({data:{id:key,scan_status:'clean',object_key:'private/object',size:10,sha256:'a'.repeat(64)},error:null}),storage:{from:()=>({download:async()=>({data:new Blob(['wrong']),error:null})})}}};
 const denied=await cataloguePhotoResponse(client('admin',false),service,product);assert.equal(denied.status,404);assert.equal(privileged,0);
 const wrong=await cataloguePhotoResponse(client(),service,product);assert.equal(wrong.status,503);assert.equal((await wrong.text()).includes('private/object'),false);assert.equal(wrong.headers.get('cache-control'),'private, no-store');
});
