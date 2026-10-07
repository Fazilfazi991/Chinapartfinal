import {approvedSiteOrigin} from './site-indexing.mjs';
const staticPaths=['','/information/about','/information/how-it-works','/information/contact','/information/faqs','/information/shipping','/guides/quality-options','/guides/oem-number','/guides/request-information'];
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function publicCanonical(path,env=process.env){const origin=approvedSiteOrigin(env);return origin&&typeof path==='string'&&/^\/(?:catalogue(?:\/[a-f0-9-]{36})?|content\/[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(path)?origin+path:null;}
export function staticSitemap(env=process.env){const origin=approvedSiteOrigin(env);return origin?staticPaths.map(path=>({url:origin+path})):[];}
export async function readPublicSitemap(client,env=process.env){
 const entries=staticSitemap(env),origin=approvedSiteOrigin(env);if(!origin||!client||env.CPS_PUBLICATION_ENABLED!=='true')return entries;
 const seen=new Set(entries.map(row=>row.url));
 const add=path=>{const url=publicCanonical(path,env);if(url&&!seen.has(url)&&entries.length<50000){entries.push({url});seen.add(url)}};
 // Projected anonymous RLS reads only. No contacts/files/service client or caller
 // URLs; stable pagination avoids PostgREST's default first-1000 truncation.
 async function pages(table,columns,sort,filters,consume){
  for(let page=0;entries.length<50000&&page<100;page++){
   let query=client.from(table).select(columns).order(sort,{ascending:true}).range(page*500,page*500+499);
   for(const [key,value] of filters)query=query.eq(key,value);
   const {data,error}=await query;if(error||!Array.isArray(data))throw new Error('Public index temporarily unavailable.');
   data.forEach(consume);if(data.length<500)break;
  }
 }
 await pages('cps_published_pages','slug','slug',[],row=>{if(typeof row.slug==='string'&&row.slug.length<=80&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug))add('/content/'+row.slug)});
 if(env.CPS_PUBLIC_CATALOGUE_ENABLED==='true'){
  add('/catalogue');await pages('cps_catalogue','id,version,approved_version','id',[['published',true],['approved',true],['archived',false]],row=>{if(uuid(row.id)&&row.version===row.approved_version)add('/catalogue/'+row.id.toLowerCase())});
 }
 return entries;
}
