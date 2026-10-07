// Called only inside database-check's new synthetic database. Never hosted data.
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {readFileSync,writeFileSync}=require('node:fs');
const {createServer}=require('node:http');
const {createClient}=require('@supabase/supabase-js');
module.exports=async function({sql,asyncSql,asUser,agent,other,admin,disabled,officeA,officeB,id}){
  sql(readFileSync('database/workspace-template.sql','utf8'));
  sql(readFileSync('database/workspace-writes-template.sql','utf8'));
  sql(readFileSync('database/administration-template.sql','utf8'));
  sql(readFileSync('database/catalogue-photos-template.sql','utf8'));
  sql(readFileSync('database/workspace-pagination-template.sql','utf8'));
  const customerA=randomUUID(),customerB=randomUUID(),inactive=randomUUID(),companyA=randomUUID(),companyB=randomUUID(),requestA=randomUUID(),requestB=randomUUID(),orderA=randomUUID(),invoiceA=randomUUID(),internal=randomUUID(),visible=randomUUID();
  const items=JSON.stringify([{description:'Synthetic filter',partNumber:'DEMO',quantity:1}]);
  sql(`insert into auth.users(id) values('${customerA}'),('${customerB}'),('${inactive}');
  insert into public.cps_companies(id,office_id,name) values('${companyA}','${officeA}','Synthetic A'),('${companyB}','${officeB}','Synthetic B');
  insert into public.cps_customer_members(user_id,company_id,active) values('${customerA}','${companyA}',true),('${customerB}','${companyB}',true),('${inactive}','${companyA}',false);
  insert into public.cps_portal_requests(id,company_id,reference,items) values('${requestA}','${companyA}','DEMO-A','${items}'),('${requestB}','${companyB}','DEMO-B','${items}');
  insert into public.cps_portal_comments(id,request_id,author_id,body,visibility) values('${internal}','${requestA}','${agent}','PRIVATE INTERNAL NOTE','internal'),('${visible}','${requestA}','${agent}','Customer update','customer');
  insert into public.cps_order_drafts(id,company_id,request_id,reference,items) values('${orderA}','${companyA}','${requestA}','DEMO-ORDER','${items}');
  insert into public.cps_invoice_drafts(id,company_id,order_id,reference,currency,scale,lines) values('${invoiceA}','${companyA}','${orderA}','DEMO-DRAFT','AED',2,'[{"description":"Synthetic line","quantity":1,"unitMinor":100}]');
  insert into public.cps_tracking_events(order_id,label,detail) values('${orderA}','Synthetic event','No shipment booked');
  insert into public.cps_catalogue(title,category,description) values('Draft item','Filters','Synthetic draft');
  insert into public.cps_content_drafts(slug,title,body) values('demo','Draft page','Synthetic plain text');`);
  assert.equal(asUser(customerA,'select count(*) from public.cps_portal_requests;'),'1');
  assert.equal(asUser(customerB,`select count(*) from public.cps_portal_requests where id='${requestA}';`),'0');
  assert.equal(asUser(other,`select count(*) from public.cps_portal_requests where id='${requestA}';`),'0');
  assert.equal(asUser(agent,'select count(*) from public.cps_portal_requests;'),'1');
  assert.equal(asUser(admin,'select count(*) from public.cps_portal_requests;'),'2');
  assert.equal(asUser(inactive,'select count(*) from public.cps_portal_requests;'),'0');
  assert.equal(asUser(disabled,'select count(*) from public.cps_portal_requests;'),'0');
  assert.equal(asUser(customerA,'select count(*) from public.cps_portal_comments;'),'1');
  assert.equal(asUser(agent,'select count(*) from public.cps_portal_comments;'),'2');
  assert.equal(asUser(customerA,'select count(*) from public.cps_order_drafts;'),'0');
  assert.equal(asUser(customerA,'select count(*) from public.cps_invoice_drafts;'),'0');
  assert.equal(asUser(customerA,'select count(*) from public.cps_tracking_events;'),'0');
  assert.equal(asUser(customerA,'select count(*) from public.cps_catalogue;'),'0');
  assert.equal(asUser(agent,'select count(*) from public.cps_content_drafts;'),'0');
  assert.equal(asUser(admin,'select count(*) from public.cps_content_drafts;'),'1');
  for(const table of ['cps_companies','cps_portal_requests','cps_portal_comments','cps_order_drafts','cps_invoice_drafts','cps_payment_events','cps_tracking_events','cps_support_threads','cps_catalogue','cps_content_drafts']){
    if(table!=='cps_catalogue')assert.throws(()=>sql(`set role anon; select * from public.${table};`),/permission denied/);
    assert.throws(()=>asUser(admin,`delete from public.${table};`),/permission denied/);
  }
  assert.throws(()=>sql(`insert into public.cps_order_drafts(company_id,request_id,reference,items) values('${companyB}','${requestA}','BAD-COMPANY','${items}');`),/foreign key/);
  assert.throws(()=>sql(`update public.cps_catalogue set published=true;`),/check constraint/);
  sql(`update public.cps_order_drafts set customer_visible=true,review_version=version; update public.cps_invoice_drafts set customer_visible=true,review_version=version; update public.cps_tracking_events set customer_visible=true,review_version=version; update public.cps_catalogue set approved=true,published=true,approved_version=version;`);
  assert.equal(asUser(customerA,'select count(*) from public.cps_order_drafts;'),'1');
  assert.equal(asUser(customerB,'select count(*) from public.cps_order_drafts;'),'0');
  assert.equal(asUser(customerA,'select count(*) from public.cps_invoice_drafts;'),'1');
  assert.equal(asUser(customerA,'select count(*) from public.cps_tracking_events;'),'1');
  // A user with both roles cannot read another office's internal conversation.
  sql(`insert into public.cps_customer_members(user_id,company_id,active) values('${other}','${companyA}',true);`);
  assert.equal(asUser(other,`select count(*) from public.cps_portal_comments where id='${internal}';`),'0');
  const sessions=new Set([customerA,customerB,inactive,agent,other,admin,disabled]);
  const fixture=await require('./workspace-provider-fixture.cjs')({sql,asyncSql,asUser,sessions});
  try{
    const {readWorkspaceResource}=await import('../lib/workspace-reader.mjs');
    const client=fixture.client;
    for(const token of ['missing',randomUUID()])await assert.rejects(readWorkspaceResource(client(token),'customer','requests'),error=>error.status===401);
    assert.equal(fixture.reads,0);
    for(const [token,mode] of [[inactive,'customer'],[disabled,'staff']])await assert.rejects(readWorkspaceResource(client(token),mode,'requests'),error=>error.status===403);
    const a=await readWorkspaceResource(client(customerA),'customer','requests');assert.equal(a.rows.length,1);assert.equal(a.rows[0].id,requestA);
    const b=await readWorkspaceResource(client(customerB),'customer','requests');assert.equal(b.rows[0].id,requestB);
    const comments=await readWorkspaceResource(client(customerA),'customer','comments');assert.equal(comments.rows.length,1);assert.equal(JSON.stringify(comments).includes('PRIVATE INTERNAL'),false);
    assert.equal((await readWorkspaceResource(client(other),'staff','requests')).rows.length,1);
    assert.equal((await readWorkspaceResource(client(other),'staff','comments')).rows.length,0);
    assert.equal((await readWorkspaceResource(client(agent),'staff','orders')).rows.length,1);
    assert.equal((await readWorkspaceResource(client(customerB),'customer','invoices')).rows.length,0);
    await require('./workspace-writes-check.cjs')({sql,asyncSql,asUser,fixture,customerA,customerB,inactive,agent,other,admin,disabled,companyA,companyB,requestA,requestB,orderA,invoiceA,legacyId:id});
    await require('./pagination-recovery-check.cjs')({sql,asUser,fixture,customerA,customerB,inactive,agent,other,admin,disabled,companyA,companyB,requestA,requestB,orderA,officeA});
    await require('./administration-check.cjs')({sql,asyncSql,asUser,fixture,agent,other,admin,disabled,customerA,customerB,inactive,companyA,companyB,requestA,officeA,officeB,id});
    await require('./catalogue-photo-check.cjs')({sql,asUser,fixture,admin,agent,customerA,disabled});
    sessions.delete(customerA);await assert.rejects(readWorkspaceResource(client(customerA),'customer','orders'),error=>error.status===401);
    const result={passed:true,liveSupabase:false,database:'isolated PostgreSQL 17.11',provider:'local HTTP fixture through real Supabase SDK',checks:['anonymous and direct authenticated writes denied','inactive/missing/expired identities denied','cross-company and cross-office reads denied','internal comments hidden from customers and cross-office dual-role user','draft documents hidden until explicit visibility','parent-child company mismatch rejected','catalogue publication requires approval','staff reader independently pins office scope','customer reader independently pins company/visibility','content drafts admin-only']};
    writeFileSync('evidence/workspace-provider-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  }finally{await fixture.close();}
};
