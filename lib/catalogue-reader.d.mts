import type {SupabaseClient} from '@supabase/supabase-js';
export class CatalogueReadError extends Error {status:number;constructor(message:string,status?:number);}
export type CatalogueEntry={id:string;title:string;part_number:string;brand:string;category:string;description:string;image_asset:string;photo_id:string|null;photo_alt:string};
export function catalogueFilters(params?:Record<string,unknown>):{q:string;category:string;brand:string;page:number};
export function readCatalogue(client:SupabaseClient,params?:Record<string,unknown>):Promise<{filters:ReturnType<typeof catalogueFilters>;rows:CatalogueEntry[];hasMore:boolean;facets:{brands:string[];categories:string[]}}>;
export function readCatalogueDetail(client:SupabaseClient,id:string):Promise<CatalogueEntry>;
