// User-scoped provider read boundary. Never use an ingestion/service-role client.
export class WorkspaceAccessError extends Error {
  constructor(message, status=403) {super(message);this.status=status;}
}
const resources={
  companies:['cps_companies','id,office_id,name,contact,email,version,created_at'],
  requests:['cps_portal_requests','id,company_id,reference,status,items,assigned_to,requirement_context,version,created_at'],
  comments:['cps_portal_comments','id,request_id,author_id,body,visibility,created_at'],
  orders:['cps_order_drafts','id,company_id,request_id,reference,status,items,shipping_note,customer_visible,review_version,archived,version,created_at'],
  invoices:['cps_invoice_drafts','id,company_id,order_id,reference,currency,scale,lines,tax_minor,customer_visible,review_version,archived,version,created_at'],
  payments:['cps_payment_events','id,company_id,invoice_id,provider_event_id,currency,amount_minor,created_at'],
  tracking:['cps_tracking_events','id,order_id,label,detail,customer_visible,review_version,archived,version,created_at'],
  support:['cps_support_threads','id,company_id,subject,body,status,version,created_at'],
  catalogue:['cps_catalogue','id,title,part_number,brand,category,description,published,approved,approved_version,archived,image_asset,photo_id,photo_alt,version,created_at'],
  replies:['cps_support_replies','id,thread_id,author_id,body,created_at'],
  notes:['cps_portal_notes','request_id,body'],
  companyNotes:['cps_company_notes','company_id,body'],
  content:['cps_content_drafts','id,title,slug,body,published,approved_version,version,created_at'],
  audit:['cps_workspace_audit','id,actor_id,company_id,operation,resource_id,created_at'],
};
export async function verifiedWorkspaceIdentity(client,mode) {
  const {data,error}=await client.auth.getUser();
  if(error||!data?.user||data.user.is_anonymous)throw new WorkspaceAccessError('Sign in through the configured provider.',401);
  const user=data.user;
  if(mode==='staff') {
    const membership=await client.from('cps_staff_members').select('role,office_id,active').eq('user_id',user.id).maybeSingle();
    if(membership.error||!membership.data?.active||!['admin','agent'].includes(membership.data.role))throw new WorkspaceAccessError('Active staff membership required.');
    return {userId:user.id,mode,role:membership.data.role,officeId:membership.data.office_id};
  }
  if(mode!=='customer')throw new WorkspaceAccessError('Workspace unavailable.',404);
  const membership=await client.from('cps_customer_members').select('company_id,active').eq('user_id',user.id).maybeSingle();
  if(membership.error||!membership.data?.active||!membership.data.company_id)throw new WorkspaceAccessError('Active customer membership required.');
  return {userId:user.id,mode,companyId:membership.data.company_id};
}
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function workspacePage(value=0){if(!Number.isSafeInteger(value)||value<0||value>10000)throw new WorkspaceAccessError('Check the workspace page.',400);return value;}
export async function readWorkspaceResource(client,mode,resource,page=0,options={}) {
 const identity=await verifiedWorkspaceIdentity(client,mode);
 return queryResource(client,identity,resource,page,options);
}
async function queryResource(client,identity,resource,page=0,{ids=null,parent=null}={}) {
 workspacePage(page);
 if(!Object.hasOwn(resources,resource)||identity.mode==='customer'&&['notes','companyNotes','content','audit'].includes(resource)||['content','audit'].includes(resource)&&identity.role!=='admin')throw new WorkspaceAccessError('Resource unavailable.',404);
 if(ids!==null&&(!Array.isArray(ids)||ids.length>100||ids.some(id=>!uuid(id))||resource==='audit')||parent!==null&&!uuid(parent))throw new WorkspaceAccessError('Resource unavailable.',404);
 const {data,error}=await client.rpc('cps_workspace_page',{p_mode:identity.mode,p_resource:resource,p_page:page,p_ids:ids,p_parent:parent});
 if(error)throw new WorkspaceAccessError('Workspace data is unavailable.',503);
 if(!data||!Array.isArray(data.rows)||typeof data.hasMore!=='boolean')throw new WorkspaceAccessError('Workspace data is unavailable.',503);
 return {identity,resource,page,pageSize:ids?100:50,hasMore:data.hasMore,rows:data.rows};
}
const mainResources=['companies','requests','orders','invoices','payments','support','catalogue','content','audit'];
export async function readWorkspaceSnapshot(client,mode,{focus=null,page=0,id=null,children={}}={}){
 const identity=await verifiedWorkspaceIdentity(client,mode);workspacePage(page);
 if(focus!==null&&!mainResources.includes(focus)||id!==null&&(!uuid(id)||!focus||focus==='audit'))throw new WorkspaceAccessError('Resource unavailable.',404);
 if(!children||typeof children!=='object'||Array.isArray(children)||Object.keys(children).some(key=>!['comments','tracking','replies'].includes(key)))throw new WorkspaceAccessError('Check the conversation page.',400);
 for(const value of Object.values(children))workspacePage(value);
 const selected=mainResources.filter(resource=>mode==='customer'?!['content','audit'].includes(resource):!['content','audit'].includes(resource)||identity.role==='admin');
 if(focus&&!selected.includes(focus))throw new WorkspaceAccessError('Resource unavailable.',404);
 const results=await Promise.all(selected.map(resource=>queryResource(client,identity,resource,resource===focus?page:0)));
 const r=Object.fromEntries(results.map(result=>[result.resource,result.rows]));
 const paging=Object.fromEntries(results.map(result=>[result.resource,{page:result.page,hasMore:result.hasMore,listIds:result.rows.map(row=>String(row.id))}]));
 async function hydrate(resource,ids){
  const unique=[...new Set(ids.filter(Boolean))].filter(id=>!r[resource]?.some(row=>row.id===id));
  for(let start=0;start<unique.length;start+=50){const result=await queryResource(client,identity,resource,0,{ids:unique.slice(start,start+50)});r[resource]=[...(r[resource]??[]),...result.rows];}
 }
 if(id){const result=await queryResource(client,identity,focus,0,{ids:[id]});if(!result.rows.length)throw new WorkspaceAccessError('Record unavailable.',404);r[focus]=[...r[focus].filter(row=>row.id!==id),...result.rows];}
 await hydrate('invoices',(r.payments??[]).map(row=>row.invoice_id));
 await hydrate('orders',(r.invoices??[]).map(row=>row.order_id));
 await hydrate('requests',(r.orders??[]).map(row=>row.request_id));
 await hydrate('companies',['requests','orders','invoices','payments','support'].flatMap(resource=>(r[resource]??[]).map(row=>row.company_id)));
 const childKinds=focus==='requests'?['comments',...mode==='staff'?['notes']:[]]:focus==='orders'?['tracking']:focus==='support'?['replies']:focus==='companies'&&mode==='staff'?['companyNotes']:[];
 for(const resource of childKinds){if(id){const result=await queryResource(client,identity,resource,children[resource]??0,{parent:id});r[resource]=result.rows;paging[resource]={page:result.page,hasMore:result.hasMore,listIds:result.rows.map(row=>String(row.id??row.request_id??row.company_id))};}}
 return {identity,resources:r,paging};
}
export async function readWorkspaceSelector(client,serviceFactory,mode,kind,page=0,id=null){
 const identity=await verifiedWorkspaceIdentity(client,mode);workspacePage(page);
 if(id!==null&&!uuid(id))throw new WorkspaceAccessError('Selection unavailable.',404);
 if(['offices','staff'].includes(kind)){
  if(identity.mode!=='staff'||identity.role!=='admin')throw new WorkspaceAccessError('Selection unavailable.',404);
  const {data,error}=await serviceFactory().rpc('cps_admin_selector',{p_actor:identity.userId,p_kind:kind,p_page:page,p_id:id});
  if(error||!data||!Array.isArray(data.rows)||typeof data.hasMore!=='boolean')throw new WorkspaceAccessError('Selection unavailable.',503);
  return data;
 }
 if(!['companies','requests','orders'].includes(kind))throw new WorkspaceAccessError('Selection unavailable.',404);
 const result=await queryResource(client,identity,kind,page);
 const selected=id?(await queryResource(client,identity,kind,0,{ids:[id]})).rows[0]:null;
 const option=row=>row?{id:row.id,label:row.name??row.reference}:null;
 return {page,hasMore:result.hasMore,rows:result.rows.map(option),selected:option(selected)};
}
