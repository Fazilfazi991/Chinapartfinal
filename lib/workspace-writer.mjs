import {createHash} from 'node:crypto';
import {verifiedWorkspaceIdentity,WorkspaceAccessError} from './workspace-reader.mjs';
import {validCatalogueAsset} from './catalogue-assets.mjs';
const reject=(message,status=400)=>{throw new WorkspaceAccessError(message,status)};
const text=(value,label,max=200,optional=false)=>{if(typeof value!=='string')reject(`${label} must be text.`);const result=value.trim();if((!optional&&!result)||result.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(result))reject(`Check ${label.toLowerCase()}.`);return result;};
const uuid=(value,label='Record')=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)?value.toLowerCase():reject(`${label} ID is invalid.`);
const integer=(value,label,min=0,max=100000000)=>Number.isSafeInteger(value)&&value>=min&&value<=max?value:reject(`Check ${label.toLowerCase()}.`);
const choice=(value,values,label)=>values.includes(value)?value:reject(`Check ${label.toLowerCase()}.`);
const staffOnly=new Set(['request.update','customer.update','order.create','order.update','order.tracking','invoice.save','support.status']);
const adminOnly=new Set(['office.save','staff.save','customer.membership.save','rfq.assign','request.assign','document.review','document.publish','document.unpublish','document.archive','document.restore','company.create','catalogue.save','catalogue.approve','catalogue.publish','catalogue.unpublish','content.save','content.approve','content.publish','content.unpublish','rfq.link']);
const items=(values,invoice=false)=>{if(!Array.isArray(values)||!values.length||values.length>50)reject('Provide 1–50 lines.');return values.map(item=>{if(!item||typeof item!=='object')reject('Invalid line.');return {description:text(item.description,'Line description',300),quantity:integer(item.quantity,'Quantity',1,999999),...invoice?{unitMinor:integer(item.unitMinor,'Unit amount')}:{partNumber:text(item.partNumber??'','Part number',100,true)}};});};
export function validateWorkspaceCommand(command,identity,{publication=false,linking=false,documents=null}={}){
 if(!command||typeof command!=='object'||Array.isArray(command))reject('Invalid operation.');
 const key=uuid(command.key,'Operation'),type=command.type,input=command.input??{};
 if(!input||typeof input!=='object'||Array.isArray(input))reject('Invalid operation fields.');
 if(staffOnly.has(type)&&identity.mode!=='staff')reject('Staff access required.',403);
 if(adminOnly.has(type)&&(identity.mode!=='staff'||identity.role!=='admin'))reject('Administrator access required.',403);
 if(['invoice.issue','payment.start','message.send','document.visibility'].includes(type))reject('Commercial execution and document publication require approved configuration.',503);
 if(['catalogue.publish','content.publish'].includes(type)&&!publication)reject('Public publication is not activated.',503);
 if(type==='rfq.link'&&!linking)reject('Reviewed RFQ ownership linking is not activated.',503);
 const record=()=>({id:uuid(input.id),version:integer(input.version,'Version',0,2147483646)});
 let fields;
 switch(type){
  case 'request.create':if(identity.mode!=='customer')reject('Customer membership required.',403);fields={items:items(input.items)};break;
  case 'request.update':fields={...record(),status:choice(input.status,['Submitted','Under review','Needs information','Closed'],'Status'),internalNote:text(input.internalNote??'','Internal note',2000,true)};break;
  case 'request.comment':fields={...record(),body:text(input.body,'Comment',2000),visibility:identity.mode==='customer'?'customer':choice(input.visibility,['customer','internal'],'Visibility')};break;
  case 'customer.update':fields={...record(),contact:text(input.contact,'Contact'),note:text(input.note??'','Internal note',2000,true)};break;
  case 'company.create':fields={name:text(input.name,'Company name'),contact:text(input.contact??'','Contact',200,true),email:text(input.email??'','Email',200,true),officeId:uuid(input.officeId,'Office')};break;
  case 'office.save':fields={...input.id?record():{},name:text(input.name,'Office name'),active:choice(input.active,[true,false],'Active state')};break;
  case 'staff.save':fields={userId:uuid(input.userId,'Provider account'),version:input.version===null?null:integer(input.version,'Version',0,2147483646),role:choice(input.role,['agent','admin'],'Role'),officeId:input.role==='admin'?null:uuid(input.officeId,'Office'),active:choice(input.active,[true,false],'Active state'),label:text(input.label??'','Account label',100,true)};break;
  case 'customer.membership.save':fields={userId:uuid(input.userId,'Provider account'),version:input.version===null?null:integer(input.version,'Version',0,2147483646),companyId:uuid(input.companyId,'Company'),active:choice(input.active,[true,false],'Active state'),label:text(input.label??'','Account label',100,true)};break;
  case 'rfq.assign':fields={...record(),officeId:uuid(input.officeId,'Office'),assigneeId:input.assigneeId===null?null:uuid(input.assigneeId,'Staff account')};break;
  case 'request.assign':fields={...record(),assigneeId:input.assigneeId===null?null:uuid(input.assigneeId,'Staff account')};break;
  case 'document.review':case 'document.publish':case 'document.unpublish':case 'document.archive':case 'document.restore':{
   const kind=choice(input.kind,['order','invoice','tracking'],'Draft kind');if(type==='document.publish'&&(!documents||!documents.kinds.includes(kind)))reject('Draft sharing requires an approved policy.',503);
   fields={...record(),kind,note:text(input.note??'','Review evidence',1000,type!=='document.review')};break;
  }
  case 'order.create':fields={requestId:uuid(input.requestId,'Request')};break;
  case 'order.update':fields={...record(),status:choice(input.status,['Draft','Ready for internal review'],'Draft status'),shippingNote:text(input.shippingNote??'','Shipping note',2000,true)};break;
  case 'order.tracking':fields={...record(),label:text(input.label,'Event title',100),detail:text(input.detail,'Event description',1000)};break;
  case 'invoice.save':{
   const currency=text(input.currency,'Currency',3);if(!/^[A-Z]{3}$/.test(currency))reject('Use an explicit three-letter currency code.');
   const lines=items(input.lines,true),subtotal=lines.reduce((sum,line)=>sum+line.quantity*line.unitMinor,0);if(!Number.isSafeInteger(subtotal)||subtotal>10000000000)reject('Draft amount is too large.');
   fields={...input.id?record():{},orderId:uuid(input.orderId,'Order'),currency,scale:integer(input.scale,'Currency scale',0,3),lines,taxMinor:input.taxMinor===null?null:integer(input.taxMinor,'Draft tax amount')};break;
  }
  case 'support.create':if(identity.mode!=='customer')reject('Customer membership required.',403);fields={subject:text(input.subject,'Subject'),body:text(input.body,'Message',2000)};break;
  case 'support.reply':fields={...record(),body:text(input.body,'Reply',2000)};break;
  case 'support.status':fields={...record(),status:choice(input.status,['Open','Under review','Closed'],'Support status')};break;
  case 'catalogue.save':{const imageAsset=input.imageAsset??'';if(!validCatalogueAsset(imageAsset))reject('Choose a managed illustration.');fields={...input.id?record():{},title:text(input.title,'Product name'),partNumber:text(input.partNumber??'','Part number',100,true),brand:text(input.brand??'','Brand',100,true),category:text(input.category,'Category',100),description:text(input.description,'Description',2000),archived:input.visibility==='archived',imageAsset};break;}
  case 'catalogue.approve':case 'catalogue.publish':case 'catalogue.unpublish':case 'content.approve':case 'content.publish':case 'content.unpublish':fields=record();break;
  case 'content.save':{const slug=text(input.slug,'Slug',80);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))reject('Use a lowercase page slug.');fields={...input.id?record():{},title:text(input.title,'Page title'),slug,body:text(input.body,'Page body',10000)};break;}
  case 'rfq.link':fields={rfqId:uuid(input.rfqId,'RFQ'),companyId:uuid(input.companyId,'Company'),evidence:text(input.evidence,'Ownership review evidence',1000)};break;
  default:reject('Unsupported workspace operation.');
 }
 return {key,type,input:fields};
}
export async function writeWorkspaceCommand(userClient,serviceClient,mode,command,options={}){
 const identity=await verifiedWorkspaceIdentity(userClient,mode);
 const canonical=validateWorkspaceCommand(command,identity,options);
 const digest=createHash('sha256').update(JSON.stringify({actor:identity.userId,mode,command:canonical})).digest('hex');
 // Construct privileged client only after fresh provider identity + validation.
 const {data,error}=await serviceClient().rpc('cps_workspace_mutate',{p_actor:identity.userId,p_mode:mode,p_key:canonical.key,p_digest:digest,p_command:{type:canonical.type,input:canonical.input},p_publication:options.publication===true,p_linking:options.linking===true,p_document_kinds:options.documents?.kinds??[],p_policy_reference:options.documents?.reference??''});
 if(error){const code=error.message;const mapped={workspace_access:['Workspace access required.',403],record_unavailable:['Record unavailable.',404],version_conflict:['This record changed. Reload before saving.',409],operation_conflict:['This operation key was used for different data.',409],publication_disabled:['Public publication is not activated.',503],linking_disabled:['Reviewed RFQ ownership linking is not activated.',503],approval_required:['Approve the current draft before publication.',409],invalid_command:['Check the operation fields.',400],link_conflict:['This RFQ is already linked to a different company.',409],office_unavailable:['Choose an active office.',400],office_in_use:['This office is still in use.',409],account_unavailable:['Use an existing provider account.',400],self_change_blocked:['Another administrator must change your own access.',409],last_admin:['Keep an active administrator.',409],assignee_unavailable:['Choose active staff in the assigned office.',400],draft_archived:['Restore the archived draft first.',409],document_policy_required:['Draft sharing requires an approved policy.',503],parent_not_shared:['Share the reviewed parent order first.',409]};const [message,status]=mapped[code]??['Workspace save is unavailable. No success was confirmed.',503];reject(message,status);}
 if(!data||typeof data.id!=='string'||!Number.isSafeInteger(data.version))reject('Workspace save returned no valid acknowledgement.',503);
 return data;
}
