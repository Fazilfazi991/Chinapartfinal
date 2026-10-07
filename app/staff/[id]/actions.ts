"use server";
import {staffContext,ingestionClient} from '../../../lib/supabase/server';
import {redirect} from 'next/navigation';
import {persistenceReady} from '../../../lib/config.mjs';
export async function updateRequest(form:FormData){
  const context=await staffContext();if(!context) redirect('/staff/login?error=access');
  const id=form.get('id'),status=form.get('status'),note=form.get('note'),version=Number(form.get('version'));
  if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id)||typeof status!=='string'||!['Submitted','UnderReview','NeedsInformation','Closed'].includes(status)||typeof note!=='string'||note.length>2000||!Number.isSafeInteger(version)) redirect('/staff');
  if(!persistenceReady()) redirect(`/staff/${id}?error=setup`);
  const {error}=await ingestionClient().rpc('cps_update_rfq',{p_id:id,p_actor:context.user.id,p_status:status,p_note:note,p_expected:version});
  redirect(`/staff/${id}${error?'?error=update':''}`);
}
