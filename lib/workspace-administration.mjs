import {verifiedWorkspaceIdentity,WorkspaceAccessError} from './workspace-reader.mjs';
export async function readWorkspaceAdministration(client,service,page=0){
 const identity=await verifiedWorkspaceIdentity(client,'staff');if(identity.role!=='admin')throw new WorkspaceAccessError('Administrator access required.');
 if(!Number.isSafeInteger(page)||page<0||page>10000)throw new WorkspaceAccessError('Page unavailable.',404);
 const {data,error}=await service().rpc('cps_admin_snapshot',{p_actor:identity.userId,p_page:page});
 if(error||!data||!Array.isArray(data.offices)||!Array.isArray(data.staff)||!Array.isArray(data.members)||!Array.isArray(data.rfqs))throw new WorkspaceAccessError('Administration data is unavailable.',503);
 return {offices:data.offices.map(x=>({id:x.id,name:x.name,active:x.active,version:x.version})),staff:data.staff.map(x=>({id:x.user_id,userId:x.user_id,label:x.label,role:x.role,officeId:x.office_id,active:x.active,version:x.version})),members:data.members.map(x=>({id:x.user_id,userId:x.user_id,label:x.label,companyId:x.company_id,active:x.active,version:x.version})),rfqs:data.rfqs.map(x=>({id:x.id,reference:x.reference,officeId:x.office_id,assigneeId:x.assigned_to,version:x.status_version,status:x.status}))};
}
