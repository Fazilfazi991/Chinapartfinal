import type {SupabaseClient} from '@supabase/supabase-js';
export function photoCommand(command:any):any;
export function normalizeCataloguePhoto(bytes:Uint8Array,type:string):Promise<{bytes:Buffer;sha256:string;size:number;width:number;height:number;type:string;content:string}>;
export function writeCataloguePhoto(reader:SupabaseClient,service:()=>SupabaseClient,command:unknown,options?:{enabled?:boolean;scanner?:((image:any)=>Promise<string>)|null}):Promise<any>;
export function cataloguePhotoResponse(reader:SupabaseClient,service:()=>SupabaseClient,id:string,options?:{staff?:boolean}):Promise<Response>;
