import type {SupabaseClient} from '@supabase/supabase-js';
type Options={publication?:boolean;linking?:boolean;documents?:{kinds:string[];reference:string}|null};
export function validateWorkspaceCommand(command:unknown,identity:{userId:string;mode:string;role?:string},options?:Options):{key:string;type:string;input:Record<string,unknown>};
export function writeWorkspaceCommand(client:SupabaseClient,service:()=>SupabaseClient,mode:'staff'|'customer',command:unknown,options?:Options):Promise<{id:string;version:number;repeated?:boolean}>;
