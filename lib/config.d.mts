export function backendMode(env?: NodeJS.ProcessEnv): 'local'|'supabase'|'disabled';
export function uploadsEnabled(env?: NodeJS.ProcessEnv): boolean;
export function vendorBackendMode(env?:NodeJS.ProcessEnv):'disabled'|'local'|'supabase';
export function vendorOriginAllowed(request:Request,env?:NodeJS.ProcessEnv):boolean;
export function staffAuthReady(env?:NodeJS.ProcessEnv):boolean;
export function persistenceReady(env?:NodeJS.ProcessEnv):boolean;
export function workspaceWritesReady(env?:NodeJS.ProcessEnv):boolean;
export function workspaceOriginAllowed(request:Request,env?:NodeJS.ProcessEnv):boolean;
export type ConfigurationIssue={key:string;section:string;code:string;message:string;severity:'error'|'warning'};
export function inspectConfiguration(env?:NodeJS.ProcessEnv):{mode:'local'|'supabase'|'disabled';authReady:boolean;persistenceReady:boolean;submissionsReady:boolean;uploadsReady:boolean;uploadsEnabled:boolean;issues:ConfigurationIssue[]};
export function allowedOrigin(request:Request,env?:NodeJS.ProcessEnv):boolean;
export function canReadRequest(member:{active:boolean;role:string;office_id:string|null}|null,request:{office_id:string|null}):boolean;

export function cataloguePhotosReady(env?:NodeJS.ProcessEnv):boolean;
