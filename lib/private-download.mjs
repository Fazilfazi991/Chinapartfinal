import {authorizedAttachment} from './production-store.mjs';
import {RequestError} from './local-store.mjs';
const privateHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"};
export async function privateDownload(userClient, storageClient, id) {
  try {
    if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))throw new RequestError('Attachment not found.',404);
    const file=await authorizedAttachment(userClient,id);
    // Construct the privileged client only after provider identity and RLS checks.
    const {data,error}=await storageClient().storage.from('cps-rfq-private').download(file.object_key);
    if(error||!data)throw new RequestError('Attachment unavailable.',503);
    return new Response(data,{headers:{...privateHeaders,'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(file.name)}`}});
  } catch(error) {
    return Response.json({error:error instanceof RequestError?error.message:'Attachment unavailable.'},{status:error instanceof RequestError?error.status:503,headers:privateHeaders});
  }
}
