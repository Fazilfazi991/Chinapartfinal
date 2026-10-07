const {execFileSync,execFile}=require('node:child_process');
const {readFileSync,writeFileSync}=require('node:fs');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const psql=process.env.CPS_PSQL;
if(!psql)throw new Error('Set CPS_PSQL to the installed psql executable.');
const args=['-h','127.0.0.1','-p','6547','-U','cps_test','-d','postgres','-X','-q','-t','-A','-v','ON_ERROR_STOP=1'];
const sql=text=>execFileSync(psql,args,{input:text,encoding:'utf8'}).trim();
const asyncSql=text=>new Promise((resolve,reject)=>{const child=execFile(psql,args,{encoding:'utf8'},(error,stdout,stderr)=>error?reject(new Error(stderr)):resolve(stdout.trim()));child.stdin.end(text);});
const quote=value=>"'"+value.replaceAll("'","''")+"'";
let ownedDatabase;
(async()=>{
  sql(`do $$ begin if not exists(select from pg_roles where rolname='anon') then create role anon nologin; end if; if not exists(select from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; if not exists(select from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if; end $$;`);
  const database='cps_rfq_'+randomUUID().replaceAll('-','');sql(`create database ${database};`);ownedDatabase=database;args[args.indexOf('-d')+1]=database;
  sql(`create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,public to anon,authenticated,service_role;
    grant execute on function auth.uid() to authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  sql(readFileSync('database/bootstrap.sql','utf8'));
  const id=randomUUID(),digest='a'.repeat(64),agent=randomUUID(),other=randomUUID(),admin=randomUUID(),disabled=randomUUID(),officeA=randomUUID(),officeB=randomUUID();
  const data={...require('../lib/rfq.mjs').blank,name:'DB Synthetic',email:'qa@example.test',country:'Qatar',category:'Truck',description:'Oil filter'};
  const file={object_key:`${id}/${digest}/0`,name:'synthetic.pdf',mime:'application/pdf',size:20,sha256:'b'.repeat(64),scan_status:'clean'};
  const submit=`set role service_role; select public.cps_submit_rfq('${id}','${digest}',${quote(JSON.stringify(data))}::jsonb,${quote(JSON.stringify([file]))}::jsonb)->>'reference';`;
  const refs=await Promise.all(Array.from({length:8},()=>asyncSql(submit)));
  assert.equal(new Set(refs).size,1);
  assert.equal(sql('select count(*) from public.cps_rfqs;'),'1');
  assert.equal(sql('select count(*) from public.cps_attachments;'),'1');
  assert.throws(()=>sql(submit.replace(digest,'c'.repeat(64))),/idempotency_conflict/);
  assert.throws(()=>sql(`set role anon; select * from public.cps_rfqs;`),/permission denied/);
  assert.throws(()=>sql(`set role authenticated; select public.cps_submit_rfq('${randomUUID()}','${digest}',${quote(JSON.stringify(data))}::jsonb,'[]');`),/permission denied/);
  sql(`insert into auth.users(id) values('${agent}'),('${other}'),('${admin}'),('${disabled}'); insert into public.cps_staff_members(user_id,role,office_id,active) values('${agent}','agent','${officeA}',true),('${other}','agent','${officeB}',true),('${admin}','admin',null,true),('${disabled}','admin',null,false); update public.cps_rfqs set office_id='${officeA}' where id='${id}';`);
  const asUser=(user,query)=>sql(`set role authenticated; set request.jwt.claim.sub='${user}'; ${query}`);
  assert.equal(asUser(agent,'select count(*) from public.cps_rfqs;'),'1');
  assert.equal(asUser(other,'select count(*) from public.cps_rfqs;'),'0');
  assert.equal(asUser(admin,'select count(*) from public.cps_rfqs;'),'1');
  assert.equal(asUser(disabled,'select count(*) from public.cps_rfqs;'),'0');
  assert.equal(asUser(other,'select count(*) from public.cps_attachments;'),'0');
  assert.equal(asUser(agent,'select count(*) from public.cps_attachments;'),'1');
  assert.throws(()=>asUser(agent,`update public.cps_rfqs set internal_note='bypass';`),/permission denied/);
  assert.throws(()=>sql(`set role service_role; select public.cps_update_rfq('${id}','${other}','UnderReview','wrong office',0);`),/request_unavailable/);
  sql(`set role service_role; select public.cps_update_rfq('${id}','${agent}','UnderReview','Synthetic review',0);`);
  assert.throws(()=>sql(`set role service_role; select public.cps_update_rfq('${id}','${agent}','Closed','stale overwrite',0);`),/concurrent_update/);
  assert.equal(sql(`select status_version from public.cps_rfqs where id='${id}';`),'1');
  assert.equal(sql(`select count(*) from public.cps_audit where rfq_id='${id}';`),'2');
  // A failed attachment insert must roll back the RFQ and audit together.
  const failedId=randomUUID();assert.throws(()=>sql(`set role service_role; select public.cps_submit_rfq('${failedId}','${digest}',${quote(JSON.stringify(data))}::jsonb,${quote(JSON.stringify([{...file,object_key:`${failedId}/${digest}/0`,size:1048577}]))}::jsonb);`));
  assert.equal(sql(`select count(*) from public.cps_rfqs where id='${failedId}';`),'0');
  await require('./provider-integration.cjs')({sql,asUser,agent,other,admin,disabled,id});
  await require('./workspace-database.cjs')({sql,asyncSql,asUser,agent,other,admin,disabled,officeA,officeB,id});
  const result={passed:true,postgres:'17.11',checks:['eight concurrent database submissions produce one reference and attachment','digest conflict rejected','anonymous read denied','authenticated ingestion RPC denied','office-scoped RFQ and attachment RLS','inactive staff denied','direct status bypass denied','cross-office mutation denied','optimistic concurrency and audit','attachment failure rolls back request'],liveSupabase:false};
  writeFileSync('evidence/database-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{
  // Only the random database created by THIS invocation, through its fixed
  // loopback fixture connection. No FORCE and no other session termination.
  if(ownedDatabase){if(!/^cps_rfq_[a-f0-9]{32}$/.test(ownedDatabase))throw new Error('Unsafe fixture database cleanup');args[args.indexOf('-d')+1]='postgres';sql(`drop database ${ownedDatabase};`);console.log('Dropped this invocation’s synthetic database.');}
});
