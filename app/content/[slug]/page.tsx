import {publicCanonical} from '../../../lib/public-index.mjs';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {publicContentClient} from '../../../lib/public-content';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>80)return {robots:{index:false,follow:false}};
 const client=publicContentClient();if(!client)return {robots:{index:false,follow:false}};
 const {data,error}=await client.from('cps_published_pages').select('title').eq('slug',slug).maybeSingle();if(error||!data)return {robots:{index:false,follow:false}};
 const canonical=publicCanonical('/content/'+slug);return {title:data.title+' | China Parts Shop',...canonical?{alternates:{canonical}}:{}};
}
export default async function PublishedPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>80)notFound();
 const client=publicContentClient();if(!client)notFound();
 const {data,error}=await client.from('cps_published_pages').select('title,body').eq('slug',slug).maybeSingle();
 if(error)return <main className="request-page"><section className="request-shell"><h1>Page temporarily unavailable</h1><Link href="/">Back to China Parts Shop</Link></section></main>;
 if(!data)notFound();
 return <main className="request-page"><article className="request-shell"><Link href="/">China Parts Shop</Link><h1>{data.title}</h1><p style={{whiteSpace:'pre-wrap'}}>{data.body}</p></article></main>;
}
