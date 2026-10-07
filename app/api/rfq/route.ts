import { join } from 'node:path';
import { checkedFile, saveRequest, RequestError } from '../../../lib/local-store.mjs';
import {backendMode,allowedOrigin,uploadsEnabled} from '../../../lib/config.mjs';
import {saveProduction,scanFile,verifyChallenge} from '../../../lib/production-store.mjs';
import {ingestionClient} from '../../../lib/supabase/server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const mode=backendMode();
  if(mode==='disabled') return Response.json({error:'Request submission is not yet available. Please try again later.'},{status:503});
  if(!allowedOrigin(request)) return Response.json({error:'Invalid request origin.'},{status:403});
  try {
    if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new RequestError('Use the request form.');
    // Production stays below Vercel's function request-body limit.
    const limit = (mode==='local'?16:4) * 1024 * 1024;
    if (Number(request.headers.get('content-length')) > limit) throw new RequestError('Request exceeds the upload limit.',413);
    const reader = request.body?.getReader();
    if (!reader) throw new RequestError('Request body is missing.');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const {done,value} = await reader.read(); if(done) break; size += value.length; if(size > limit) {await reader.cancel(); throw new RequestError('Request exceeds the upload limit.',413);} chunks.push(value); }
    const body = Buffer.concat(chunks);
    const form = await new Response(body,{headers:{'content-type':request.headers.get('content-type')!}}).formData();
    const raw = form.get('data');
    if (typeof raw !== 'string' || raw.length > 12000) throw new RequestError('Invalid request fields.');
    let input: unknown; try {input=JSON.parse(raw);} catch {throw new RequestError('Invalid request fields.');}
    const files = form.getAll('attachments');
    if(files.length > 3) throw new RequestError('Attach up to three files.');
    if(files.length && !uploadsEnabled()) throw new RequestError('Attachments are not yet enabled. Remove the files and retry.',503);
    const attachments = await Promise.all(files.map(async file => { if (!(file instanceof File)) throw new RequestError('Invalid attachment.'); return checkedFile(file.name,file.type,Buffer.from(await file.arrayBuffer())); }));
    const id = form.get('submissionId'); if(typeof id !== 'string') throw new RequestError('Missing submission key.');
    let result;
    if(mode==='local') result=await saveRequest(join(process.cwd(),'.local-data','rfqs'),input,attachments,id);
    else {
      await verifyChallenge(form.get('challenge'),{secret:process.env.TURNSTILE_SECRET_KEY!,hostname:new URL(process.env.CPS_SITE_ORIGIN!).hostname});
      result=await saveProduction(ingestionClient(),input,attachments,id,uploadsEnabled()?file=>scanFile(file,{url:process.env.CPS_SCANNER_URL!,token:process.env.CPS_SCANNER_TOKEN!}):null);
    }
    return Response.json(result,{status:201,headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    if(error instanceof RequestError) return Response.json({error:error.message},{status:error.status});
    return Response.json({error:'We could not save your request. Your draft is retained; please retry.'},{status:500});
  }
}
