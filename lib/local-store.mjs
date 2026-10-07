import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fields, validate } from './rfq.mjs';
export class RequestError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export function checkedFile(name, type, bytes) {
  if (bytes.length > 5 * 1024 * 1024 || !bytes.length) throw new RequestError('Each attachment must be between 1 byte and 5 MB.');
  const ext = name.split('.').pop()?.toLowerCase();
  const valid = (ext === 'png' && type === 'image/png' && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ||
    (['jpg','jpeg'].includes(ext) && type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    (ext === 'pdf' && type === 'application/pdf' && bytes.subarray(0,5).toString() === '%PDF-');
  if (!valid) throw new RequestError('Use a PNG, JPEG or PDF with matching file contents.');
  return { name: name.replace(/[\x00-\x1f\/\\]/g,'_').slice(0,160), type, size: bytes.length, content: bytes.toString('base64') };
}
let queue = Promise.resolve();
export async function saveRequest(directory, input, attachments, id) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new RequestError('Invalid submission key.');
  const errors = validate(input);
  if (Object.keys(errors).length) throw new RequestError('Please correct the request fields.');
  if (attachments.length > 3) throw new RequestError('Attach up to three files.');
  const data = Object.fromEntries(fields.map(k => [k,input[k].trim()]));
  const digest = createHash('sha256').update(JSON.stringify({data, attachments})).digest('hex');
  const task = queue.then(async () => {
    await mkdir(directory, { recursive: true });
    const file = join(directory, `${id}.json`);
    try {
      const old = JSON.parse(await readFile(file,'utf8'));
      if (old.digest !== digest) throw new RequestError('This submission key already belongs to a different request. Start a new request.',409);
      return { reference: old.reference, localTest: true };
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const record = { reference: `CPS-LOCAL-${randomUUID()}`, createdAt: new Date().toISOString(), status:'Submitted', digest, data, attachments };
    const temp = `${file}.${randomUUID()}.tmp`;
    try { await writeFile(temp, JSON.stringify(record), {flag:'wx', mode:0o600}); await rename(temp,file); }
    finally { await unlink(temp).catch(()=>{}); }
    return { reference: record.reference, localTest: true };
  });
  queue = task.catch(()=>{});
  return task;
}
