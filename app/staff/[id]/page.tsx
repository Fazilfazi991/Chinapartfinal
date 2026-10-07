import ReviewedLink from '../../../components/workspace/ReviewedLink';
import {workspaceWritesReady} from '../../../lib/config.mjs';
import {staffContext} from '../../../lib/supabase/server';
import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import {updateRequest} from './actions';
import {fields} from '../../../lib/rfq.mjs';
export const dynamic='force-dynamic';
export default async function Detail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
  const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))notFound();
  const context=await staffContext();if(!context)redirect('/staff/login?error=access');
  const {data:row,error}=await context.client.from('cps_rfqs').select('id,reference,status,status_version,data,internal_note').eq('id',id).maybeSingle();
  if(error||!row)notFound();
  const [{data:attachments},{data:events},query]=await Promise.all([context.client.from('cps_attachments').select('id,name,scan_status').eq('rfq_id',id),context.client.from('cps_audit').select('created_at,event').eq('rfq_id',id).order('created_at',{ascending:false}).limit(30),searchParams]);
  const linking=context.member.role==='admin'&&workspaceWritesReady()&&process.env.CPS_RFQ_LINKING_ENABLED==='true';
  const companies=linking?(await context.client.from('cps_companies').select('id,name').order('name').limit(100)).data??[]:[];
  return <main className="request-page"><section className="request-shell"><Link href="/staff">Back to inbox</Link><h1>{row.reference}</h1><div className="request-review"><dl>{fields.map(key=><div key={key}><dt>{key}</dt><dd>{row.data[key]||'Not provided'}</dd></div>)}</dl><h2>Attachments</h2>{attachments?.length?<ul>{attachments.map(file=><li key={file.id}>{file.scan_status==='clean'?<a href={`/api/staff/attachments/${file.id}`}>{file.name}</a>:<span>{file.name} · unavailable pending scanning</span>}</li>)}</ul>:<p>No attachments.</p>}</div><h2>Internal review</h2>{query.error&&<p role="alert">The update could not be saved. Another staff member may have changed this request. Review the current values and retry.</p>}<form action={updateRequest} className="request-fields"><input type="hidden" name="id" value={id}/><input type="hidden" name="version" value={row.status_version}/><div><label htmlFor="status">Status</label><select id="status" name="status" defaultValue={row.status}>{['Submitted','UnderReview','NeedsInformation','Closed'].map(status=><option key={status}>{status}</option>)}</select></div><div><label htmlFor="note">Internal note</label><textarea id="note" name="note" rows={4} maxLength={2000} defaultValue={row.internal_note||''}/></div><button className="request-primary">Save internal review</button></form>{linking&&<ReviewedLink id={id} companies={companies}/>}<h2>Activity</h2><ul>{events?.map((event,i)=><li key={i}>{new Date(event.created_at).toISOString()} · {event.event}</li>)}</ul></section></main>;
}
