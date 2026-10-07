import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import PreviewWorkspace from '../../../../components/workspace/PreviewWorkspace';
import {authConfigured,userClient} from '../../../../lib/supabase/server';
import {verifiedWorkspaceIdentity} from '../../../../lib/workspace-reader.mjs';
import {documentPolicy} from '../../../../lib/document-policy.mjs';
import {workspaceWritesReady,cataloguePhotosReady} from '../../../../lib/config.mjs';
import {customerAuthEnabled} from '../../../../lib/customer-auth.mjs';
import {customerLogout} from '../../../customer-access/actions';
import {logout} from '../../../staff/login/actions';
import '../../../preview/workspace.css';
export const dynamic='force-dynamic';
export const metadata={title:'Workspace | China Parts Shop',robots:{index:false,follow:false}};
export default async function Workspace({params,searchParams}:{params:Promise<{mode:string;section?:string[]}>;searchParams:Promise<{error?:string;page?:string;record?:string}>}){
 const {mode,section=['overview']}=await params;
 if(!['admin','customer'].includes(mode)||section.length!==1||!['overview','requests','catalogue','customers','orders','invoices','payments','support','content','audit','administration'].includes(section[0]))notFound();
 const customer=mode==='customer';
 if(process.env.CPS_WORKSPACE_READS_ENABLED!=='true'||!authConfigured()||customer&&!customerAuthEnabled())return <main className="request-page"><section className="request-shell"><h1>Workspace access is not activated</h1><p>Please contact the sourcing team about your request.</p><Link href="/request">Send a parts enquiry</Link></section></main>;
 let identity;try{identity=await verifiedWorkspaceIdentity(await userClient(),customer?'customer':'staff');}catch{redirect(customer?'/customer-access?error=access':'/staff/login?error=access');}
 if(customer&&['customers','content','audit','administration'].includes(section[0])||identity.role!=='admin'&&['content','audit','administration'].includes(section[0]))notFound();
 const query=await searchParams;const page=Number(query.page??0);if(!Number.isSafeInteger(page)||page<0||page>10000||query.record&&!/^[a-f0-9-]{36}$/i.test(query.record))notFound();
 return <>{query.error&&<p role="alert" className="ws-alert">Sign out could not be confirmed. Please try again.</p>}<form action={customer?customerLogout:logout} className="ws-session"><span>{customer?'Company account':'Staff account'}</span><button type="submit" className="ws-secondary">Sign out</button></form><PreviewWorkspace key={`${mode}:${identity.userId}:${section[0]}`} section={section[0]} mode={mode as 'admin'|'customer'} initialActor={identity.userId} dataSource="provider" verifiedRole={customer?'customer':identity.role} writes={workspaceWritesReady()} publication={process.env.CPS_PUBLICATION_ENABLED==='true'} documents={documentPolicy()?.kinds??[]} photos={cataloguePhotosReady()} initialPage={page} initialRecord={query.record??''}/></>;
}
