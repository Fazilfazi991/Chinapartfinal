import '../catalogue.css';
import {publicCanonical} from '../../../lib/public-index.mjs';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {publicContentClient} from '../../../lib/public-content';
import {CatalogueReadError,readCatalogueDetail} from '../../../lib/catalogue-reader.mjs';
import {cataloguePhotosReady} from '../../../lib/config.mjs';
import {validCatalogueAsset} from '../../../lib/catalogue-assets.mjs';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const id=(await params).id,client=publicContentClient();if(!client||process.env.CPS_PUBLIC_CATALOGUE_ENABLED!=='true')return {title:'Catalogue entry unavailable',robots:{index:false,follow:false}};
 try{const row=await readCatalogueDetail(client,id),canonical=publicCanonical('/catalogue/'+row.id.toLowerCase());return {title:row.title+' | China Parts Shop',...canonical?{alternates:{canonical}}:{}};}catch{return {title:'Catalogue entry unavailable',robots:{index:false,follow:false}};}
}
export default async function CatalogueDetail({params}:{params:Promise<{id:string}>}){
 const client=publicContentClient();if(!client||process.env.CPS_PUBLIC_CATALOGUE_ENABLED!=='true')notFound();
 let item;try{item=await readCatalogueDetail(client,(await params).id);}catch(error){if(error instanceof CatalogueReadError&&error.status===404)notFound();return <main className="request-page catalogue-page"><section className="request-shell"><Link href="/catalogue">Catalogue</Link><p role="alert">This entry is temporarily unavailable.</p></section></main>;}
 return <main className="request-page catalogue-page"><section className="request-shell"><Link href="/catalogue">Back to catalogue</Link><h1>{item.title}</h1>{cataloguePhotosReady()&&item.photo_id?<figure><img src={`/api/catalogue/photos/${item.id}`} alt={item.photo_alt} width={320}/></figure>:item.image_asset&&validCatalogueAsset(item.image_asset)?<figure><img src={item.image_asset} alt="Parts sourcing illustration" width={320}/><figcaption>Illustration only — not a product photo.</figcaption></figure>:<p>Product photograph not provided.</p>}<p>{item.description}</p><dl><dt>Part number</dt><dd>{item.part_number||'Unspecified'}</dd><dt>Category</dt><dd>{item.category}</dd><dt>Equipment make</dt><dd>{item.brand||'Unspecified'}</dd></dl><p>Equipment details and sourcing review are required to verify fitment, quality, price and availability.</p><Link href={`/request?part=${encodeURIComponent(`${item.title} ${item.part_number}`)}`}>Prepare a parts enquiry</Link></section></main>;
}
