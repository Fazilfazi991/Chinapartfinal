import {randomUUID} from 'node:crypto';
import {previewActors} from './preview-actors.mjs';
import {PreviewError} from './preview-error.mjs';
const fail=(message,status=400)=>{throw new PreviewError(message,status)};
const label=(value,max=200,optional=false)=>typeof value==='string'&&(optional||value.trim())&&value.trim().length<=max?value.trim():fail('Check the text fields.');
const row=value=>({id:randomUUID(),version:0,createdAt:new Date().toISOString(),...value});
export function extendPreviewState(state){return {...state,
 offices:state.offices??[{id:'north',name:'Demo North office',active:true,version:0},{id:'south',name:'Demo South office',active:true,version:0}],
 staffMembers:state.staffMembers??previewActors.filter(x=>x.role!=='customer').map(x=>({id:x.id,userId:x.id,label:x.label,role:x.role,officeId:x.office,active:true,version:0})),
 customerMembers:state.customerMembers??previewActors.filter(x=>x.role==='customer').map(x=>({id:x.id,userId:x.id,label:x.label,companyId:x.company,active:true,version:0})),
 documentReviews:state.documentReviews??[],
 };}
export function previewIdentity(state,id){const base=previewActors.find(x=>x.id===id);if(!base)fail('Select a synthetic preview actor.',401);const member=(base.role==='customer'?state.customerMembers:state.staffMembers).find(x=>x.userId===id);if(!member?.active)fail('Active preview membership required.',403);return {...base,...base.role==='customer'?{company:member.companyId}:{role:member.role,office:member.officeId}};}
export function previewAdministration(state){return {offices:state.offices,staff:state.staffMembers,members:state.customerMembers,rfqs:[]};}
export function applyPreviewAdministration(state,actor,type,input){
 if(!['office.save','staff.save','customer.membership.save','company.create','request.assign','document.review','document.publish','document.unpublish','document.archive','document.restore'].includes(type))return null;
 if(actor.role!=='admin')fail('Administrator access required.',403);
 const expected=record=>{if(record.version!==input.version)fail('This record changed. Reload before saving.',409)};
 const office=id=>state.offices.find(x=>x.id===id&&x.active)??fail('Choose an active office.');
 const active=value=>typeof value==='boolean'?value:fail('Choose an active state.');
 let saved;
 if(type==='office.save'){
  const values={name:label(input.name),active:active(input.active)};
  if(input.id){saved=state.offices.find(x=>x.id===input.id)??fail('Office unavailable.',404);expected(saved);if(!values.active&&(state.customers.some(x=>x.office===saved.id)||state.staffMembers.some(x=>x.officeId===saved.id&&x.active)))fail('Office is still in use.',409);Object.assign(saved,values);saved.version++;}else{saved=row(values);state.offices.push(saved);}
 }else if(type==='staff.save'||type==='customer.membership.save'){
  if(!previewActors.some(x=>x.id===input.userId&&(type==='staff.save'?x.role!=='customer':x.role==='customer')))fail('Choose an existing demo account.');
  const list=type==='staff.save'?state.staffMembers:state.customerMembers; saved=list.find(x=>x.userId===input.userId);
  if(saved)expected(saved);else if(input.version!==null)fail('The membership changed.',409);
  let values={userId:input.userId,label:label(input.label??'',100,true),active:active(input.active)};
  if(type==='staff.save'){
   if(!['agent','admin'].includes(input.role))fail('Choose a valid role.');const officeId=input.role==='admin'?null:office(input.officeId).id;
   if(input.userId===actor.id&&(input.role!==actor.role||!values.active||officeId!==actor.office))fail('Use another administrator for your own access changes.',409);
   values={...values,role:input.role,officeId};
  }else{if(!state.customers.some(x=>x.id===input.companyId))fail('Company unavailable.',404);values={...values,companyId:input.companyId};}
  if(saved){Object.assign(saved,values);saved.version++;}else{saved={id:input.userId,version:0,...values};list.push(saved);}
  if(type==='staff.save')for(const request of state.requests)if(request.assignedTo===saved.userId&&(!saved.active||saved.role==='agent'&&request.office!==saved.officeId)){request.assignedTo=null;request.version++;}
 }else if(type==='company.create'){
  const oid=office(input.officeId).id;saved=row({name:label(input.name),contact:label(input.contact??'',200,true),email:label(input.email??'',200,true),note:'',office:oid});saved.company=saved.id;state.customers.push(saved);
 }else if(type==='request.assign'){
  saved=state.requests.find(x=>x.id===input.id)??fail('Request unavailable.',404);expected(saved);
  if(input.assigneeId!==null&&!state.staffMembers.some(x=>x.userId===input.assigneeId&&x.active&&(x.role==='admin'||x.officeId===saved.office)))fail('Choose active staff in this office.');saved.assignedTo=input.assigneeId;saved.version++;
 }else{
  const kind=input.kind;if(!['order','invoice','tracking'].includes(kind))fail('Choose a draft kind.');
  let parent;
  if(kind==='tracking'){parent=state.orders.find(x=>x.tracking.some(t=>t.id===input.id));saved=parent?.tracking.find(x=>x.id===input.id);}else saved=state[kind==='order'?'orders':'invoices'].find(x=>x.id===input.id);
  if(!saved)fail('Draft unavailable.',404);if(saved.version===undefined)saved.version=0;expected(saved);
  if(saved.archived&&type!=='document.restore')fail('Restore the archived draft first.',409);
  if(kind==='invoice')parent=state.orders.find(x=>x.id===saved.orderId);
  if(type==='document.review'){const note=label(input.note,1000);saved.customerVisible=false;saved.version++;saved.reviewVersion=saved.version;state.documentReviews=state.documentReviews.filter(x=>x.resource!==saved.id);state.documentReviews.push({resource:saved.id,kind,note,actor:actor.id,version:saved.version});}
  else if(type==='document.publish'){if(saved.reviewVersion!==saved.version)fail('Review the current draft before sharing.',409);if(kind!=='order'&&parent?.customerVisible!==true)fail('Share the reviewed parent order first.',409);saved.customerVisible=true;saved.version++;saved.reviewVersion=saved.version;}
  else{saved.customerVisible=false;saved.reviewVersion=null;saved.archived=type==='document.archive';saved.version++;state.documentReviews=state.documentReviews.filter(x=>x.resource!==saved.id);}
  if(kind==='order'&&type!=='document.publish')withdrawPreviewChildren(state,saved.id);
 }
 return saved;
}
export function withdrawPreviewChildren(state,orderId){for(const invoice of state.invoices.filter(x=>x.orderId===orderId)){invoice.customerVisible=false;invoice.reviewVersion=null;state.documentReviews=state.documentReviews.filter(x=>x.resource!==invoice.id)}for(const event of state.orders.find(x=>x.id===orderId)?.tracking??[]){event.customerVisible=false;event.reviewVersion=null;state.documentReviews=state.documentReviews.filter(x=>x.resource!==event.id)}}
