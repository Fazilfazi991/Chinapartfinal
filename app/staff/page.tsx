import {staffContext} from '../../lib/supabase/server';
import {readStaffInbox} from '../../lib/staff-inbox.mjs';
import {redirect,notFound} from 'next/navigation';
import Link from 'next/link';
import {logout} from './login/actions';
export const dynamic='force-dynamic';
export default async function Staff({searchParams}:{searchParams:Promise<{page?:string}>}){
  const context=await staffContext();if(!context) redirect('/staff/login?error=access');
  const page=Number((await searchParams).page??0);if(!Number.isSafeInteger(page)||page<0||page>10000)notFound();let data:Record<string,any>[]=[];let error=false,hasMore=false;try{const result=await readStaffInbox(context.client,page);data=result.rows;hasMore=result.hasMore;}catch{error=true;}
  return <main className="request-page"><section className="request-shell"><div className="request-actions"><Link href="/">China Parts Shop</Link><form action={logout}><button>Sign out</button></form></div><h1>Request inbox</h1><p>Page {page+1} of requests available to your office. Internal records are visible only to approved staff.</p>{error?<p role="alert">The request inbox is unavailable. Contact your administrator.</p>:!data?.length?<p>No requests to review yet.</p>:<ul className="staff-list">{data.map(row=><li key={row.id}><Link href={`/staff/${row.id}`}><strong>{row.reference}</strong><span>{row.data?.name} · {row.data?.description||row.data?.oem}</span><span>{row.status}</span></Link></li>)}</ul>}<nav aria-label="Request inbox pages" className="request-actions">{page>0&&<Link href={`/staff?page=${page-1}`}>Previous inbox page</Link>}{!error&&hasMore&&<Link href={`/staff?page=${page+1}`}>Next inbox page</Link>}<Link href="/workspace/admin/requests">Company requests</Link><Link href="/staff/vendors">Supplier registrations</Link></nav></section></main>;
}
