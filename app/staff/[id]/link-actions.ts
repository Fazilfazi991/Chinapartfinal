'use server';
import {redirect} from 'next/navigation';
import {randomUUID} from 'node:crypto';
import {userClient,ingestionClient} from '../../../lib/supabase/server';
import {workspaceWritesReady} from '../../../lib/config.mjs';
import {writeWorkspaceCommand} from '../../../lib/workspace-writer.mjs';
export async function linkReviewedRequest(form:FormData){
 const id=form.get('rfqId');if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id))redirect('/staff');
 if(!workspaceWritesReady()||process.env.CPS_RFQ_LINKING_ENABLED!=='true')redirect(`/staff/${id}?error=link`);
 try{await writeWorkspaceCommand(await userClient(),ingestionClient,'staff',{key:randomUUID(),type:'rfq.link',input:{rfqId:id,companyId:form.get('companyId'),evidence:form.get('evidence')}},{linking:true});}
 catch{redirect(`/staff/${id}?error=link`);}
 redirect('/workspace/admin/requests');
}
