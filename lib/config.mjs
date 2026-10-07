import {documentPolicy} from './document-policy.mjs';
const booleans=['CPS_SUBMISSIONS_ENABLED','CPS_UPLOADS_ENABLED','CPS_LOCAL_TEST_BACKEND','CPS_PREVIEW_ENABLED','CPS_WORKSPACE_READS_ENABLED','CPS_WORKSPACE_WRITES_ENABLED','CPS_CUSTOMER_AUTH_ENABLED','CPS_CUSTOMER_RECOVERY_ENABLED','CPS_PUBLICATION_ENABLED','CPS_PUBLIC_CATALOGUE_ENABLED','CPS_RFQ_LINKING_ENABLED','CPS_DOCUMENT_VISIBILITY_ENABLED','CPS_CATALOGUE_PHOTOS_ENABLED','CPS_SEO_ENABLED'];
const sections={auth:['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'],persistence:['SUPABASE_SECRET_KEY'],submissions:['CPS_SITE_ORIGIN','NEXT_PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY'],uploads:['CPS_SCANNER_URL','CPS_SCANNER_TOKEN']};
const loopback=host=>['localhost','127.0.0.1','[::1]'].includes(host);
function validUrl(value,env,{origin=false,endpoint=false}={}) {
  if(typeof value!=='string'||!value||value!==value.trim())return false;
  try {
    const url=new URL(value);
    if(url.username||url.password||url.search||url.hash||url.hostname.endsWith('.example')||url.hostname.endsWith('.invalid'))return false;
    if(url.protocol!=='https:'&&!(env.NODE_ENV!=='production'&&url.protocol==='http:'&&loopback(url.hostname)))return false;
    if(env.NODE_ENV==='production'&&loopback(url.hostname))return false;
    return origin?value===url.origin:endpoint||url.pathname==='/';
  } catch {return false;}
}
function keyRole(value) {
  if(typeof value!=='string'||value!==value.trim())return null;
  if(/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(value))return 'anon';
  if(/^sb_secret_[A-Za-z0-9_-]{16,}$/.test(value))return 'service_role';
  // Compatibility check only: decoding never verifies a user or authorizes access.
  const pieces=value.split('.');
  if(pieces.length!==3||pieces.some(piece=>!piece||!/^[A-Za-z0-9_-]+$/.test(piece)))return null;
  try {const role=JSON.parse(atob(pieces[1].replaceAll('-','+').replaceAll('_','/'))).role;return ['anon','service_role'].includes(role)?role:null;}catch{return null;}
}
const token=value=>typeof value==='string'&&value.length>0&&value===value.trim()&&!/\s/.test(value)&&!/^(?:replace[_-]?me|your[_-]|placeholder)/i.test(value);
export function inspectConfiguration(env=process.env) {
  const issues=[];
  const add=(key,section,code,message,severity='error')=>issues.push({key,section,code,message,severity});
  for(const key of booleans)if(env[key]!==undefined&&!['true','false'].includes(env[key]))add(key,'flags','invalid_boolean','Use exactly true or false.');
  if(env.CPS_BACKEND!==undefined&&env.CPS_BACKEND!==''&&env.CPS_BACKEND!=='supabase')add('CPS_BACKEND','flags','invalid_backend','Use supabase or leave unset.');
  if(env.CPS_SUBMISSIONS_ENABLED==='true'&&env.CPS_BACKEND!=='supabase'&&!(env.NODE_ENV!=='production'&&env.CPS_LOCAL_TEST_BACKEND==='true'))add('CPS_BACKEND','flags','missing_backend','Enabled submissions require CPS_BACKEND=supabase.');
  for(const [key,value] of Object.entries(env))if(key.startsWith('NEXT_PUBLIC_')&&(keyRole(value)==='service_role'||/SECRET|SERVICE_ROLE|SCANNER_TOKEN/.test(key)))add(key,'public','public_secret','Privileged keys must stay in server-only variables.');
  for(const [section,keys] of Object.entries(sections))for(const key of keys){
    const value=env[key];
    if(!value){add(key,section,'missing','Not configured.');continue;}
    const valid=key==='NEXT_PUBLIC_SUPABASE_URL'?validUrl(value,env):key==='CPS_SITE_ORIGIN'?validUrl(value,env,{origin:true}):key==='CPS_SCANNER_URL'?validUrl(value,env,{endpoint:true}):key==='NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'?keyRole(value)==='anon':key==='SUPABASE_SECRET_KEY'?keyRole(value)==='service_role':token(value);
    if(!valid)add(key,section,'invalid',key.includes('URL')||key==='CPS_SITE_ORIGIN'?'Use a valid HTTPS URL without credentials, query or fragment; site origin must have no path or trailing slash.':key.includes('SUPABASE')?'Use the correct Supabase key type in this variable.':'Use a nonempty token without whitespace or placeholder text.');
  }
  if(env.CPS_LOCAL_TEST_BACKEND==='true'&&env.NODE_ENV==='production')add('CPS_LOCAL_TEST_BACKEND','local','ignored_in_production','The disk test backend is ignored in production.','warning');
  const hasErrors=section=>issues.some(issue=>issue.severity==='error'&&issue.section===section);
  const requireFeature=(key,ready,message)=>{if(env[key]==='true'&&!ready)add(key,'flags','missing_feature_dependencies',message);};
  requireFeature('CPS_WORKSPACE_READS_ENABLED',!hasErrors('auth'),'Workspace reads require configured Auth.');
  requireFeature('CPS_CUSTOMER_AUTH_ENABLED',!hasErrors('auth')&&validUrl(env.CPS_SITE_ORIGIN,env,{origin:true}),'Customer accounts require configured Auth and a valid site origin.');
  requireFeature('CPS_CUSTOMER_RECOVERY_ENABLED',env.CPS_CUSTOMER_AUTH_ENABLED==='true'&&!hasErrors('auth')&&validUrl(env.CPS_SITE_ORIGIN,env,{origin:true}),'Recovery requires configured customer Auth and a valid approved origin.');
  requireFeature('CPS_WORKSPACE_WRITES_ENABLED',env.CPS_BACKEND==='supabase'&&env.CPS_WORKSPACE_READS_ENABLED==='true'&&!hasErrors('auth')&&!hasErrors('persistence')&&validUrl(env.CPS_SITE_ORIGIN,env,{origin:true}),'Workspace writes require Supabase persistence, reads and a valid site origin.');
  requireFeature('CPS_PUBLICATION_ENABLED',env.CPS_WORKSPACE_WRITES_ENABLED==='true'&&!hasErrors('flags'),'Publication requires configured workspace writes.');
  requireFeature('CPS_RFQ_LINKING_ENABLED',env.CPS_WORKSPACE_WRITES_ENABLED==='true'&&!hasErrors('flags'),'Reviewed ownership linking requires configured workspace writes.');
  requireFeature('CPS_PUBLIC_CATALOGUE_ENABLED',env.CPS_PUBLICATION_ENABLED==='true'&&!hasErrors('flags'),'Public catalogue requires reviewed publication.');
  requireFeature('CPS_DOCUMENT_VISIBILITY_ENABLED',env.CPS_WORKSPACE_WRITES_ENABLED==='true'&&!hasErrors('flags')&&!!documentPolicy(env),'Draft sharing requires configured writes and an explicit reviewed document policy.');
  requireFeature('CPS_CATALOGUE_PHOTOS_ENABLED',env.CPS_WORKSPACE_WRITES_ENABLED==='true'&&!hasErrors('flags')&&!hasErrors('uploads'),'Catalogue photos require configured writes and scanner.');
  const validSection=name=>!issues.some(issue=>issue.severity==='error'&&(issue.section===name||issue.section==='public'));
  const authReady=validSection('auth'),persistenceReady=authReady&&validSection('persistence');
  const submissionsReady=persistenceReady&&validSection('submissions')&&validSection('flags');
  const uploadsReady=submissionsReady&&validSection('uploads');
  const local=env.CPS_LOCAL_TEST_BACKEND==='true'&&env.NODE_ENV!=='production'&&validSection('flags')&&validSection('public');
  const mode=local?'local':env.CPS_BACKEND==='supabase'&&env.CPS_SUBMISSIONS_ENABLED==='true'&&submissionsReady?'supabase':'disabled';
  return {mode,authReady,persistenceReady,submissionsReady,uploadsReady,uploadsEnabled:mode==='local'||mode==='supabase'&&env.CPS_UPLOADS_ENABLED==='true'&&uploadsReady,issues};
}
export function backendMode(env=process.env){return inspectConfiguration(env).mode;}
export function uploadsEnabled(env=process.env){return inspectConfiguration(env).uploadsEnabled;}
export function staffAuthReady(env=process.env){return inspectConfiguration(env).authReady;}
export function persistenceReady(env=process.env){return inspectConfiguration(env).persistenceReady;}
export function workspaceWritesReady(env=process.env){const report=inspectConfiguration(env);return env.CPS_BACKEND==='supabase'&&env.CPS_WORKSPACE_READS_ENABLED==='true'&&env.CPS_WORKSPACE_WRITES_ENABLED==='true'&&report.persistenceReady&&validUrl(env.CPS_SITE_ORIGIN,env,{origin:true})&&!report.issues.some(issue=>issue.section==='flags'&&issue.severity==='error');}
export function workspaceOriginAllowed(request,env=process.env){return workspaceWritesReady(env)&&request.headers.get('origin')===env.CPS_SITE_ORIGIN&&request.headers.get('sec-fetch-site')!=='cross-site';}
export function allowedOrigin(request,env=process.env) {
  const mode=backendMode(env),origin=request.headers.get('origin');
  if(mode==='disabled')return false;
  if(mode==='supabase')return origin===env.CPS_SITE_ORIGIN;
  const host=request.headers.get('host');
  return !!host&&/^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host)&&origin===`http://${host}`;
}
export function canReadRequest(member,request){return !!member?.active&&(member.role==='admin'||request.office_id===null||member.office_id===request.office_id);}

export function cataloguePhotosReady(env=process.env){return env.CPS_CATALOGUE_PHOTOS_ENABLED==='true'&&workspaceWritesReady(env)&&!inspectConfiguration(env).issues.some(issue=>issue.section==='uploads'&&issue.severity==='error');}
