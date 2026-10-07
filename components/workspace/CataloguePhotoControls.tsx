'use client';
import {useState} from 'react';
import {useWorkspaceEnvironment} from './WorkspaceEnvironment';
import {WorkspaceForm,Field,type Mutate} from './WorkspaceForms';
import type {PreviewProduct} from '../../lib/preview-domain.mjs';
export default function CataloguePhotoControls({record,mutate,pending}:{record:PreviewProduct;mutate:Mutate;pending:boolean}){
 const {live,photos}=useWorkspaceEnvironment();const [file,setFile]=useState<File|null>(null),[error,setError]=useState('');
 async function upload(data:FormData){
  if(!file||file.size>1048576||!['image/png','image/jpeg'].includes(file.type)){setError('Select a PNG/JPEG photo up to 1 MB.');return false;}setError('');
  try{const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return await mutate('catalogue.photo.upload',{id:record.id,version:record.version,alt:String(data.get('alt')??''),file:{type:file.type,size:file.size,content:btoa(binary)}});}catch{setError('The file could not be read. Select it again.');return false;}
 }
 return <section className="ws-copy-preview"><h3>Product photograph</h3>{live&&photos&&record.photoId&&<figure><img src={`/api/staff/catalogue/photos/${record.id}`} alt={record.photoAlt??''} width={240}/><figcaption>Private catalogue photo. Publication requires review of the changed entry.</figcaption></figure>}{error&&<p role="alert">{error}</p>}<WorkspaceForm pending={pending||!live||!photos||record.visibility==='archived'} button="Upload private photo" onSave={upload}><Field label="PNG / JPEG photo" hint="Up to 1 MB and 4096 pixels per side. Safe PNG conversion may need a smaller source. Metadata is removed."><input type="file" accept="image/png,image/jpeg" required onChange={event=>setFile(event.target.files?.[0]??null)}/></Field><Field label="Photo description"><input name="alt" required maxLength={200} defaultValue={record.photoAlt}/></Field><p className="ws-muted">Uploading/replacing/removing withdraws publication and approval. Only owner-approved assets should be reviewed for publication.</p></WorkspaceForm>{record.photoId&&<button type="button" className="ws-secondary" disabled={pending||!live||!photos||record.visibility==='archived'} onClick={()=>mutate('catalogue.photo.remove',{id:record.id,version:record.version})}>Remove current photo</button>}{(!live||!photos)&&<p className="ws-muted">Photo upload is disabled until private Storage and scanner acceptance. The synthetic preview uses labelled illustrations.</p>}</section>;
}
