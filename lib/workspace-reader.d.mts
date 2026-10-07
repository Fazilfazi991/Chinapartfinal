import type {SupabaseClient} from '@supabase/supabase-js';
export class WorkspaceAccessError extends Error {status:number;constructor(message:string,status?:number);}
export function verifiedWorkspaceIdentity(client:SupabaseClient,mode:'staff'|'customer'):Promise<{userId:string;mode:'staff'|'customer';role?:'admin'|'agent';officeId?:string|null;companyId?:string}>;
export function workspacePage(value?:number):number;
export function readWorkspaceResource(client:SupabaseClient,mode:'staff'|'customer',resource:string,page?:number,options?:{ids?:string[]|null;parent?:string|null}):Promise<{identity:any;resource:string;page:number;pageSize:number;hasMore:boolean;rows:Record<string,any>[]} >;
export function readWorkspaceSnapshot(client:SupabaseClient,mode:'staff'|'customer',options?:{focus?:string|null;page?:number;id?:string|null;children?:Record<string,number>}):Promise<{identity:any;resources:Record<string,any[]>;paging:Record<string,any>}>;
export function readWorkspaceSelector(client:SupabaseClient,serviceFactory:()=>SupabaseClient,mode:'staff'|'customer',kind:string,page?:number,id?:string|null):Promise<{page:number;hasMore:boolean;rows:{id:string;label:string}[];selected:{id:string;label:string}|null}>;
