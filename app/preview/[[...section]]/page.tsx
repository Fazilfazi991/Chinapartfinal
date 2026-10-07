import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import PreviewWorkspace from '../../../components/workspace/PreviewWorkspace';
import {previewEnabled,loopbackUrl} from '../../../lib/preview-store.mjs';
import {previewActors,sections} from '../../../lib/preview-domain.mjs';
import '../workspace.css';
export const dynamic='force-dynamic';
export const metadata={title:'Local proposal preview | China Parts Shop',robots:{index:false,follow:false}};
export default async function Preview({params,searchParams}:{params:Promise<{section?:string[]}>;searchParams:Promise<{actor?:string}>}){
  if(!previewEnabled())notFound();
  const requestHeaders=await headers();if(!loopbackUrl(`http://${requestHeaders.get('host')??''}`))notFound();
  const {section=[]}=await params;
  if(!section.length)return <main className="ws-hub"><Link className="ws-brand" href="/"><img src="/cps-logo.png" alt="" width={48} height={48}/><strong>CHINA PARTS SHOP</strong></Link><p className="ws-eyebrow">DELL LOCAL PREVIEW</p><h1>From parts request<br/>to sourcing workbench.</h1><p className="ws-hub-lead">Explore the proposal workflows using clearly labelled synthetic companies, parts and draft amounts. Nothing here sends a message, takes a payment or issues a commercial document.</p><div className="ws-hub-grid"><Link href="/preview/admin/overview"><span>01 / STAFF</span><h2>Sourcing workbench</h2><p>RFQ review, catalogue, customer records, order drafts, invoice drafts, support and audit.</p><strong>Open staff preview →</strong></Link><Link href="/preview/customer/overview"><span>02 / CUSTOMER</span><h2>Customer workspace</h2><p>Multi-part requests, comments, catalogue, order updates, tracking and document history.</p><strong>Open customer preview →</strong></Link></div><p className="ws-muted">Local fixture persistence is separate from the public RFQ test records. Live provider sign-in, Supabase, payments and communications remain unconfigured. The preview routes are disabled in production.</p><Link className="ws-secondary" href="/">Review enquiry-first homepage</Link></main>;
  if(section.length!==2||!['admin','customer'].includes(section[0])||!sections.includes(section[1]))notFound();
  const mode=section[0] as 'admin'|'customer';const query=await searchParams;
  const actor=previewActors.find(item=>item.id===query.actor&&(mode==='customer'?item.role==='customer':item.role!=='customer'))?.id??(mode==='customer'?'customer-a':'admin');
  if(mode==='customer'&&['customers','content','audit','administration'].includes(section[1]))notFound();
  if(actor!=='admin'&&['content','audit','administration'].includes(section[1])&&mode!=='customer')notFound();
  return <PreviewWorkspace key={`${mode}:${actor}:${section[1]}`} mode={mode} section={section[1]} initialActor={actor}/>;
}
