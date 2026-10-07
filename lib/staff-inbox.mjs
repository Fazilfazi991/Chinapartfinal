import {verifiedWorkspaceIdentity,workspacePage,WorkspaceAccessError} from './workspace-reader.mjs';
export async function readStaffInbox(client,page=0){
 await verifiedWorkspaceIdentity(client,'staff');workspacePage(page);
 // User-scoped RLS preserves the existing office/unassigned policy. No service
 // client, inferred sharing policy, or public reference search.
 const {data,error}=await client.from('cps_rfqs').select('id,reference,status,created_at,data').order('created_at',{ascending:false}).order('id',{ascending:true}).range(page*50,page*50+50);
 if(error||!Array.isArray(data))throw new WorkspaceAccessError('Request inbox unavailable.',503);
 return {page,rows:data.slice(0,50),hasMore:data.length>50};
}
