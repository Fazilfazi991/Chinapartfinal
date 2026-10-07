'use client';
import {useEffect,useState} from 'react';
import {useWorkspaceEnvironment} from './WorkspaceEnvironment';
type Option={id:string;label:string};
export default function ScopedSelector({kind,name,id,required=true,defaultValue='',options=[],disabled=false}:{kind:string;name:string;id?:string;required?:boolean;defaultValue?:string;options?:Option[];disabled?:boolean}){
 const {live,mode}=useWorkspaceEnvironment();
 const [page,setPage]=useState(0),[reload,setReload]=useState(0),[rows,setRows]=useState(options),[value,setValue]=useState(defaultValue),[chosen,setChosen]=useState<Option|null>(options.find(row=>row.id===defaultValue)??null),[more,setMore]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  if(!live)return;const abort=new AbortController();setLoading(true);setError('');
  const query=new URLSearchParams({mode,resource:'selector',kind,page:String(page)});if(defaultValue)query.set('id',defaultValue);
  fetch('/api/workspace?'+query,{cache:'no-store',signal:abort.signal}).then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error);if(!abort.signal.aborted){setRows(result.rows);setMore(result.hasMore);if(result.selected)setChosen(current=>current??result.selected);}}).catch(error=>{if(!abort.signal.aborted){setRows([]);setMore(false);setError(error.message??'Selections unavailable.');}}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});
  return ()=>abort.abort();
 },[live,mode,kind,page,defaultValue,reload]);
 const entries=chosen&&!rows.some(row=>row.id===chosen.id)?[chosen,...rows]:rows;
 return <div><select id={id} name={name} required={required} value={value} disabled={disabled||loading||!!error} onChange={event=>{setValue(event.target.value);setChosen(entries.find(row=>row.id===event.target.value)??null)}}><option value="">Select {kind==='staff'?'staff / office queue':kind==='companies'?'a company':kind==='offices'?'an active office':kind==='requests'?'a request':'an order'}</option>{entries.map(row=><option key={row.id} value={row.id}>{row.label}</option>)}</select>{live&&<div className="ws-actions"><button type="button" className="ws-secondary" disabled={disabled||loading||page===0} onClick={()=>setPage(page-1)}>Previous {kind} choices</button><small>{loading?'Loading choices.':`Choices page ${page+1}`}</small><button type="button" className="ws-secondary" disabled={disabled||loading||!more} onClick={()=>setPage(page+1)}>Next {kind} choices</button></div>}{error&&<p role="alert">{error} <button type="button" className="ws-secondary" onClick={()=>setReload(reload+1)}>Reload choices</button></p>}</div>;
}
