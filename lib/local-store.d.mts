export class RequestError extends Error { status: number; constructor(message: string, status?: number); }
export function checkedFile(name: string, type: string, bytes: Buffer): {name:string;type:string;size:number;content:string};
export function saveRequest(directory:string,input:unknown,attachments:ReturnType<typeof checkedFile>[],id:string):Promise<{reference:string;localTest:boolean}>;
