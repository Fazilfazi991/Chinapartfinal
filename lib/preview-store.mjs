import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PreviewError, initialPreviewState, applyPreviewCommand, previewSnapshot } from './preview-domain.mjs';

export function previewEnabled(env = process.env) {
  return env.NODE_ENV === 'development' && env.CPS_PREVIEW_ENABLED === 'true';
}
export function loopbackUrl(value) {
  try { const url = new URL(value); return url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) && !url.username && !url.password; }
  catch { return false; }
}
export function assertPreviewRequest(request, env = process.env) {
  if (!previewEnabled(env)) throw new PreviewError('Preview unavailable.', 404);
  if (!loopbackUrl(request.url)) throw new PreviewError('Local preview access only.', 403);
  // Next's internal Request URL can normalize 127.0.0.1 to localhost. Use the
  // original validated Host authority for browser-origin comparison; never
  // trust forwarded host headers or accept arbitrary origins.
  const host = request.headers.get('host');
  if (!host || !/^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d{1,5})?$/.test(host) || !loopbackUrl(`http://${host}`)) throw new PreviewError('Local preview access only.', 403);
  // Reject foreign browser requests before touching the fixture or trusting actor IDs.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(`http://${host}`).origin) throw new PreviewError('Request origin rejected.', 403);
  if (request.method !== 'GET' && !origin) throw new PreviewError('A local request origin is required.', 403);
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new PreviewError('Request origin rejected.', 403);
}
// Single local process only. This store is never a production/serverless adapter.
const queues = new Map();
export async function transactPreview(directory, actor, command) {
  const root = resolve(directory);
  const task = (queues.get(root) ?? Promise.resolve()).then(async () => {
    const state = await readState(root);
    if (!command) return previewSnapshot(state, actor);
    const update = applyPreviewCommand(state, actor, command);
    if (!update.repeated) {
      await mkdir(root, { recursive: true });
      const target = join(root, 'synthetic-workspace.json');
      const temporary = join(root, `synthetic-${randomUUID()}.tmp`);
      try { await writeFile(temporary, JSON.stringify(update.state), { flag: 'wx', mode: 0o600 }); await rename(temporary, target); }
      finally { await unlink(temporary).catch(() => {}); }
    }
    return { ...update.result, repeated: update.repeated };
  });
  queues.set(root, task.catch(() => {}));
  return task;
}
async function readState(root) {
  try {
    const state = JSON.parse(await readFile(join(root, 'synthetic-workspace.json'), 'utf8'));
    if (state.schema !== 1 || state.synthetic !== true) throw new PreviewError('Unrecognized preview fixture. No data was changed.', 503);
    return state;
  } catch (error) { if (error.code === 'ENOENT') return initialPreviewState(); throw error; }
}
