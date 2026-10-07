// Local provider HTTP fixture plus real PostgreSQL RLS. No production auth hooks.
const {createServer}=require('node:http');
const {createClient}=require('@supabase/supabase-js');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {writeFileSync}=require('node:fs');
module.exports=async function({sql,asUser,agent,other,admin,disabled,id}) {
  const {privateDownload}=await import('../lib/private-download.mjs');
  const attachment=sql(`select id from public.cps_attachments where rfq_id='${id}';`);
  const key=sql(`select object_key from public.cps_attachments where id='${attachment}';`);
  const sessions=new Map([[agent,agent],[other,other],[admin,admin],[disabled,disabled]]);
  let storageReads=0,privilegedClients=0;
  const respond=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  const server=createServer((req,res)=>{
    try {
      const url=new URL(req.url,'http://127.0.0.1');
      const token=(req.headers.authorization||'').replace(/^Bearer /,'');
      const user=sessions.get(token);
      if(url.pathname==='/auth/v1/user')return user?respond(res,200,{id:user,aud:'authenticated',role:'authenticated',email:'qa@example.test',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}):respond(res,401,{code:'bad_jwt',message:'Invalid fixture session'});
      if(url.pathname.startsWith('/rest/v1/')) {
        if(!user)return respond(res,401,{message:'No fixture session'});
        const table=url.pathname.split('/').at(-1);
        if(!['cps_staff_members','cps_attachments','cps_rfqs'].includes(table))return respond(res,404,{});
        const filter=table==='cps_staff_members'?'user_id':'id';
        const target=url.searchParams.get(filter)?.replace(/^eq\./,'');
        if(!/^[a-f0-9-]{36}$/i.test(target||''))return respond(res,400,{});
        const rows=JSON.parse(asUser(user,`select coalesce(json_agg(t),'[]'::json) from (select * from public.${table} where ${filter}='${target}') t;`));
        return respond(res,200,rows);
      }
      if(url.pathname.startsWith('/storage/v1/object/')) {
        if(token!=='fixture-service')return respond(res,403,{message:'Private fixture bucket'});
        const expected='/storage/v1/object/cps-rfq-private/'+key;
        if(url.pathname!==expected)return respond(res,404,{});
        storageReads++;res.writeHead(200,{'Content-Type':'application/pdf'});res.end('%PDF-1.7 synthetic private content');return;
      }
      return respond(res,404,{});
    } catch {respond(res,500,{message:'Fixture failed'});}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const client=token=>createClient(base,'fixture-public',{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
  const storage=()=>{privilegedClients++;return createClient(base,'fixture-service',{auth:{persistSession:false,autoRefreshToken:false}});};
  try {
    for(const [token,status] of [['missing',401],[randomUUID(),401],[disabled,403],[other,404]]) {
      const response=await privateDownload(client(token),storage,attachment);
      assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'private, no-store');
      const body=await response.text();assert.equal(body.includes(key),false);assert.equal(body.includes('http'),false);
    }
    assert.equal(storageReads,0);assert.equal(privilegedClients,0);
    for(const token of [agent,admin]) {
      const response=await privateDownload(client(token),storage,attachment);
      assert.equal(response.status,200);assert.match(response.headers.get('content-disposition'),/^attachment;/);
      assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.match(await response.text(),/^%PDF/);
    }
    const direct=await client(other).storage.from('cps-rfq-private').download(key);assert.ok(direct.error);
    const forged=await client(other).from('cps_rfqs').select('*').eq('id',id);assert.deepEqual(forged.data,[]);
    const unknown=await privateDownload(client(agent),storage,randomUUID());assert.equal(unknown.status,404);
    sql(`update public.cps_attachments set scan_status='quarantined' where id='${attachment}';`);
    const quarantined=await privateDownload(client(agent),storage,attachment);assert.equal(quarantined.status,404);
    sql(`update public.cps_attachments set scan_status='clean' where id='${attachment}';`);
    sql(`update public.cps_staff_members set active=false where user_id='${agent}';`);
    const revoked=await privateDownload(client(agent),storage,attachment);assert.equal(revoked.status,403);
    sql(`update public.cps_staff_members set active=true where user_id='${agent}';`);
    sessions.delete(admin);
    const expired=await privateDownload(client(admin),storage,attachment);assert.equal(expired.status,401);
    assert.equal(storageReads,2);assert.equal(privilegedClients,2);
    const result={passed:true,provider:'local HTTP fixture through real Supabase SDK',database:'real PostgreSQL RLS',liveSupabase:false,checks:['unauthenticated and forged session denied','inactive staff denied','cross-office download and direct query denied','private direct storage denied','own-office/admin downloads succeed','unknown/quarantined files denied','membership revocation and expired provider session denied','denied access never constructs privileged storage client','no file URLs/object keys in error bodies','private cache and safe download headers']};
    writeFileSync('evidence/provider-integration-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  } finally {await new Promise(resolve=>server.close(resolve));}
};
