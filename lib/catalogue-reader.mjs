// Public reads use only the anonymous RLS client. No privileged fallback.
export class CatalogueReadError extends Error {constructor(message,status=503){super(message);this.status=status;}}
const columns='id,title,part_number,brand,category,description,image_asset,photo_id,photo_alt';
const visible=client=>client.from('cps_catalogue').select(columns).eq('published',true).eq('approved',true).eq('archived',false);
export function catalogueFilters(params={}){
 const value=(key,max)=>{const v=params[key]??'';if(typeof v!=='string'||v.length>max||/[\x00-\x1f]/.test(v))throw new CatalogueReadError('Check the catalogue filters.',400);return v.trim();};
 const page=value('page',5);if(page&&!/^\d+$/.test(page)||Number(page)>10000)throw new CatalogueReadError('Check the catalogue page.',400);
 return {q:value('q',80),category:value('category',100),brand:value('brand',100),page:Number(page||0)};
}
export async function readCatalogue(client,params={}){
 const filters=catalogueFilters(params);let query=visible(client);
 if(filters.q)query=query.textSearch('search_document',filters.q,{type:'websearch',config:'simple'});
 if(filters.category)query=query.eq('category',filters.category);
 if(filters.brand)query=query.eq('brand',filters.brand);
 const [{data,error},facets]=await Promise.all([query.order('created_at',{ascending:false}).order('id',{ascending:true}).range(filters.page*12,filters.page*12+12),client.rpc('cps_catalogue_facets')]);
 if(error||facets.error||!Array.isArray(data)||!Array.isArray(facets.data?.brands)||!Array.isArray(facets.data?.categories))throw new CatalogueReadError('The catalogue is temporarily unavailable.');
 return {filters,rows:data.slice(0,12),hasMore:data.length>12,facets:facets.data};
}
export async function readCatalogueDetail(client,id){
 if(typeof id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))throw new CatalogueReadError('Catalogue entry unavailable.',404);
 const {data,error}=await visible(client).eq('id',id).maybeSingle();if(error)throw new CatalogueReadError('The catalogue is temporarily unavailable.');if(!data)throw new CatalogueReadError('Catalogue entry unavailable.',404);return data;
}
