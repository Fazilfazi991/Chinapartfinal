import { NextResponse } from 'next/server';
import { join } from 'node:path';
import { assertPreviewRequest, transactPreview } from '../../../lib/preview-store.mjs';
import { PreviewError } from '../../../lib/preview-domain.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
async function handle(request:Request) {
  try {
    assertPreviewRequest(request);
    const actor = new URL(request.url).searchParams.get('actor') ?? '';
    let command;
    if (request.method === 'POST') {
      if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new PreviewError('Use a JSON request.', 415);
      // Enforce actual streamed bytes, regardless of missing/forged Content-Length.
      const reader = request.body?.getReader();
      if (!reader) throw new PreviewError('A request body is required.');
      const chunks:Uint8Array[]=[]; let size=0;
      try { for (;;) { const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();throw new PreviewError('Preview request exceeds 64 KB.',413);}chunks.push(value); } }
      finally { reader.releaseLock(); }
      try { command=JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { throw new PreviewError('Invalid JSON.'); }
    }
    return NextResponse.json(await transactPreview(join(process.cwd(), '.local-data', 'proposal-preview'), actor, command), {headers});
  } catch (error) {
    const status=error instanceof PreviewError?error.status:503;
    return NextResponse.json({error:error instanceof PreviewError?error.message:'Local preview storage is unavailable. No success was recorded.'},{status,headers});
  }
}
export const GET=handle;
export const POST=handle;
