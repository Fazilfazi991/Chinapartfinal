import type {SupabaseClient} from '@supabase/supabase-js';
import type {checkedFile} from './local-store.mjs';
type Attachment=ReturnType<typeof checkedFile>;
export function fingerprint(input:Record<string,string>,attachments:Attachment[]):{data:Record<string,string>;digest:string};
export function scanFile(file:Attachment,config:{url:string;token:string;fetcher?:typeof fetch}):Promise<string>;
export function verifyChallenge(token:unknown,config:{secret:string;hostname:string;action?:'rfq'|'vendor_registration';fetcher?:typeof fetch}):Promise<void>;
export function saveProduction(client:SupabaseClient,input:unknown,attachments:Attachment[],id:string,scanner:((file:Attachment)=>Promise<string>)|null):Promise<{reference:string;localTest:boolean}>;
export function authorizedAttachment(client:SupabaseClient,id:string):Promise<{object_key:string;name:string;mime:string;size:number;scan_status:string}>;
