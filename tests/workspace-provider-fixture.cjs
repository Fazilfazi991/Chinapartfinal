// LOCAL APPROVED SYNTHETIC PROVIDER. The app uses its normal SDK and SSR path.
// No fixture identity hook is included in application code or production.
const {createServer}=require('node:http');
const {createHash}=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
module.exports=async function({sql,asyncSql,asUser,sessions}){
 const allowed=new Set(['cps_rfqs','cps_customer_members','cps_staff_members','cps_companies','cps_portal_requests','cps_portal_comments','cps_order_drafts','cps_invoice_drafts','cps_payment_events','cps_tracking_events','cps_support_threads','cps_catalogue','cps_support_replies','cps_portal_notes','cps_company_notes','cps_content_drafts','cps_workspace_audit','cps_rfq_company_links','cps_published_pages','cps_document_reviews','cps_catalogue_media']);
 const publicKey='sb_publishable_synthetic_fixture_0123456789',secretKey='sb_secret_synthetic_fixture_0123456789'; // gitleaks:allow -- loopback-only invented fixture keys, never issued by Supabase
 const photoObjects=new Map();let storageReads=0,storageWrites=0,scannerMode='clean';
 const issued=new Map();const passwords=new Map();let reads=0;const recoveryRequests=[],usedRecoveryTokens=new Set();
 const user=id=>({id,aud:'authenticated',role:'authenticated',email:id+'@example.test',is_anonymous:false,app_metadata:{},user_metadata:{},created_at:new Date().toISOString()});
 const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
 const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
 const body=async req=>{let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>65536)throw new Error('invalid_command');chunks.push(chunk)}return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');};
 function issue(id){const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');const access=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:id,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})+'.synthetic_fixture_signature';issued.set(access,id);return {access_token:access,refresh_token:'fixture-refresh-'+id,expires_in:3600,token_type:'bearer',user:user(id)};}
 const server=createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://127.0.0.1'),token=(req.headers.authorization??'').replace(/^Bearer /,''),actor=issued.get(token)??token,service=token===secretKey;
  if(url.pathname==='/scanner'){
   if(req.headers.authorization!=='Bearer synthetic-scanner-token')return send(res,403,{});const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1048576)return send(res,413,{});chunks.push(chunk)}const bytes=Buffer.concat(chunks);if(scannerMode==='outage')return send(res,503,{});return send(res,200,{clean:scannerMode!=='blocked',sha256:scannerMode==='wrong'?'a'.repeat(64):createHash('sha256').update(bytes).digest('hex')});
  }
  if(url.pathname==='/auth/v1/token'&&url.searchParams.get('grant_type')==='password'){const input=await body(req);const id=passwords.get(input.email);if(!id||input.password!=='Synthetic-password-123!'||!sessions.has(id))return send(res,400,{msg:'Invalid login credentials'});return send(res,200,issue(id));}
  if(url.pathname==='/auth/v1/recover'){const input=await body(req);recoveryRequests.push({email:input.email,redirectTo:url.searchParams.get('redirect_to')});return send(res,200,{});}
  if(url.pathname==='/auth/v1/verify'){const input=await body(req),prefix=input.type==='invite'?'fixture-invite-':input.type==='recovery'?'fixture-recovery-':null;const id=prefix&&String(input.token_hash??'').startsWith(prefix)?input.token_hash.slice(prefix.length,prefix.length+36):null;if(!id||!sessions.has(id)||input.type==='recovery'&&usedRecoveryTokens.has(input.token_hash))return send(res,400,{msg:'Invalid token'});if(input.type==='recovery')usedRecoveryTokens.add(input.token_hash);return send(res,200,issue(id));}
  if(!service&&!sessions.has(actor)&&token!==publicKey)return send(res,401,{message:'Invalid synthetic provider session'});
  if(url.pathname==='/auth/v1/user'){if(!sessions.has(actor))return send(res,401,{message:'Invalid synthetic provider session'});if(req.method==='PUT'){await body(req);return send(res,200,user(actor));}return send(res,200,user(actor));}
  if(url.pathname==='/auth/v1/logout')return send(res,200,{});
  if(url.pathname.startsWith('/storage/v1/object/')){
   if(!service)return send(res,403,{message:'Private fixture bucket'});const objectKey=url.pathname.replace(/^\/storage\/v1\/object\/(?:authenticated\/)?cps-catalogue-private\//,'');if(objectKey===url.pathname)return send(res,404,{});
   if(req.method==='POST'){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1048576)return send(res,413,{});chunks.push(chunk)}if(photoObjects.has(objectKey))return send(res,409,{statusCode:409,error:'Duplicate'});photoObjects.set(objectKey,Buffer.concat(chunks));storageWrites++;return send(res,200,{Key:'cps-catalogue-private/'+objectKey});}
   if(req.method==='GET'){const bytes=photoObjects.get(objectKey);if(!bytes)return send(res,404,{});storageReads++;res.writeHead(200,{'Content-Type':'image/png'});res.end(bytes);return;}return send(res,405,{});
  }
  if(url.pathname.startsWith('/rest/v1/rpc/cps_catalogue_photo_')){
   if(!service)return send(res,403,{message:'permission denied'});const p=await body(req),rpc=url.pathname.split('/').at(-1);let query;
   if(rpc==='cps_catalogue_photo_receipt')query=`select public.cps_catalogue_photo_receipt(${quote(p.p_actor)}::uuid,${quote(p.p_key)}::uuid,${quote(p.p_digest)});`;
   else if(rpc==='cps_catalogue_photo_mutate')query=`select public.cps_catalogue_photo_mutate(${quote(p.p_actor)}::uuid,${quote(p.p_key)}::uuid,${quote(p.p_digest)},${quote(p.p_product)}::uuid,${Number(p.p_version)},${p.p_photo===null?'null':quote(JSON.stringify(p.p_photo))+'::jsonb'});`;
   else if(rpc==='cps_catalogue_photo_resolve')query=`select public.cps_catalogue_photo_resolve(${quote(p.p_product)}::uuid,${p.p_actor===null?'null':quote(p.p_actor)+'::uuid'});`;
   else return send(res,404,{});
   try{const result=await asyncSql('set role service_role;'+query);return send(res,200,result?JSON.parse(result):null);}catch(error){console.error('Synthetic photo RPC:',error.message);return send(res,400,{message:String(error.message).match(/ERROR:\s+([a-z_]+)\s*(?:\r?\n|$)/)?.[1]??'fixture_error'});}
  }
  if(url.pathname==='/rest/v1/rpc/cps_workspace_mutate'){
   if(!service)return send(res,403,{message:'permission denied'});
   const p=await body(req);if(!/^[a-f0-9-]{36}$/i.test(p.p_actor)||!/^[a-f0-9-]{36}$/i.test(p.p_key)||!/^[a-f0-9]{64}$/.test(p.p_digest)||!['staff','customer'].includes(p.p_mode))return send(res,400,{message:'invalid_command'});
   try{const result=await asyncSql(`set role service_role;select public.cps_workspace_mutate(${quote(p.p_actor)}::uuid,${quote(p.p_mode)},${quote(p.p_key)}::uuid,${quote(p.p_digest)},${quote(JSON.stringify(p.p_command))}::jsonb,${p.p_publication===true},${p.p_linking===true},array[${(p.p_document_kinds??[]).map(quote).join(',')}]::text[],${quote(p.p_policy_reference??'')});`);return send(res,200,JSON.parse(result));}
   catch(error){console.error('Synthetic RPC failure:',error.message);const code=String(error.message).match(/ERROR:\s+([a-z_]+)\s*(?:\r?\n|$)/)?.[1]??'fixture_error';return send(res,400,{message:code});}
  }
  if(url.pathname==='/rest/v1/rpc/cps_admin_snapshot'){
   if(!service)return send(res,403,{message:'permission denied'});const p=await body(req);if(!/^[a-f0-9-]{36}$/i.test(p.p_actor)||!Number.isSafeInteger(p.p_page)||p.p_page<0||p.p_page>10000)return send(res,400,{message:'invalid_command'});
   try{return send(res,200,JSON.parse(await asyncSql(`set role service_role;select public.cps_admin_snapshot(${quote(p.p_actor)}::uuid,${p.p_page});`)))}catch{return send(res,403,{message:'workspace_access'})}
  }
  if(url.pathname==='/rest/v1/rpc/cps_workspace_page'){
   const p=await body(req);if(service||!sessions.has(actor))return send(res,403,{});
   const ids=p.p_ids===null?'null':`array[${p.p_ids.map(id=>quote(id)+'::uuid').join(',')}]::uuid[]`;
   const query=`select public.cps_workspace_page(${quote(p.p_mode)},${quote(p.p_resource)},${Number(p.p_page)},${ids},${p.p_parent===null?'null':quote(p.p_parent)+'::uuid'});`;
   try{return send(res,200,JSON.parse(asUser(actor,query)))}catch(error){console.error('Synthetic scoped page:',error.message);return send(res,400,{message:'scope_or_resource_error'});}
  }
  if(url.pathname==='/rest/v1/rpc/cps_admin_selector'){
   if(!service)return send(res,403,{});const p=await body(req);
   try{return send(res,200,JSON.parse(await asyncSql(`set role service_role;select public.cps_admin_selector(${quote(p.p_actor)}::uuid,${quote(p.p_kind)},${Number(p.p_page)},${p.p_id===null?'null':quote(p.p_id)+'::uuid'});`)))}catch{return send(res,403,{message:'workspace_access'})}
  }
  if(url.pathname==='/rest/v1/rpc/cps_catalogue_facets'){return send(res,200,JSON.parse(sql('set role anon;select public.cps_catalogue_facets();')));}
  const table=url.pathname.split('/').at(-1);if(!allowed.has(table))return send(res,404,{});reads++;
  const columns=url.searchParams.get('select')??'*';if(!/^(?:\*|[a-z_,]+)$/.test(columns))return send(res,400,{});
  const clauses=[];
  for(const [key,value] of url.searchParams){if(['select','order','offset','limit'].includes(key))continue;if(!/^(?:id|user_id|office_id|company_id|request_id|order_id|thread_id|customer_visible|published|approved|archived|visibility|slug|category|brand|search_document)$/.test(key))return send(res,400,{});
   if(key==='search_document'&&value.startsWith('wfts(simple).')){clauses.push(`search_document @@ websearch_to_tsquery('simple',${quote(value.slice(13))})`);continue;}
   if(value.startsWith('eq.')){const literal=value.slice(3);if(literal.length>200||/[\x00-\x1f]/.test(literal))return send(res,400,{});clauses.push(`${key}=${quote(literal)}`);}
   else if(value.startsWith('in.(')&&value.endsWith(')')){const values=value.slice(4,-1).split(',');if(values.some(item=>!/^[a-f0-9-]{36}$/i.test(item)))return send(res,400,{});clauses.push(`${key} in (${values.map(quote).join(',')})`);}else return send(res,400,{});
  }
  const offset=Number(url.searchParams.get('offset')??0),limit=Number(url.searchParams.get('limit')??1000);if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(limit)||offset<0||limit<0||limit>1000)return send(res,400,{});
  const sort=url.searchParams.get('order')??'';if(sort&&!/^(?:created_at|id|slug)\.(?:asc|desc)(?:,(?:created_at|id|slug)\.(?:asc|desc))*$/.test(sort))return send(res,400,{});
  const query=`select coalesce(json_agg(t),'[]'::json) from (select ${columns} from public.${table}${clauses.length?' where '+clauses.join(' and '):''}${sort?' order by '+sort.replaceAll('.',' '):''} limit ${limit} offset ${offset}) t;`;
  const rows=JSON.parse(token===publicKey?sql('set role anon;'+query):asUser(actor,query));if(req.headers.accept==='application/vnd.pgrst.object+json')return rows.length===1?send(res,200,rows[0]):send(res,406,{code:'PGRST116',details:`The result contains ${rows.length} rows`});return send(res,200,rows);
 }catch{send(res,500,{message:'Synthetic provider fixture error'});}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 return {origin,publicKey,secretKey,photoObjects,get storageReads(){return storageReads},get storageWrites(){return storageWrites},set scannerMode(value){scannerMode=value},passwords,recoveryRequests,usedRecoveryTokens,issue,sessions,get reads(){return reads},authClient:()=>createClient(origin,publicKey,{auth:{persistSession:false,autoRefreshToken:false}}),client:token=>createClient(origin,publicKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}}),service:()=>createClient(origin,secretKey,{auth:{persistSession:false,autoRefreshToken:false}}),close:()=>new Promise(resolve=>server.close(resolve))};
};

