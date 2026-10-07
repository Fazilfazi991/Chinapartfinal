export function previewEnabled(env?:NodeJS.ProcessEnv):boolean;
export function loopbackUrl(value:string):boolean;
export function assertPreviewRequest(request:Request,env?:NodeJS.ProcessEnv):void;
export function transactPreview(directory:string,actor:string,command?:unknown):Promise<any>;
