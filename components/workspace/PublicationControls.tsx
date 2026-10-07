'use client';
import {useWorkspaceEnvironment} from './WorkspaceEnvironment';
import type {Mutate} from './WorkspaceForms';
export default function PublicationControls({kind,record,mutate,pending}:{kind:'catalogue'|'content';record:{id:string;version:number;visibility?:string;approved?:boolean;status?:string};mutate:Mutate;pending:boolean}){
 const {live,publication}=useWorkspaceEnvironment();if(!live)return null;
 const published=record.visibility==='published'||record.status==='Published',approved=record.approved===true||record.status==='Approved';
 return <section className="ws-copy-preview"><h3>Publication review</h3><p className="ws-muted">Review the current copy before publishing. Editing a published entry withdraws it until the changed version is reviewed.</p><div className="ws-actions"><button className="ws-secondary" disabled={pending} onClick={()=>mutate(`${kind}.approve`,{id:record.id,version:record.version})}>Approve current version</button><button className="ws-primary" disabled={pending||!publication||!approved||published||record.visibility==='archived'} onClick={()=>mutate(`${kind}.publish`,{id:record.id,version:record.version})}>Publish approved version</button>{published&&<button className="ws-secondary" disabled={pending} onClick={()=>mutate(`${kind}.unpublish`,{id:record.id,version:record.version})}>Withdraw publication</button>}</div>{!publication&&<p className="ws-muted">Public publication is not activated.</p>}</section>;
}
