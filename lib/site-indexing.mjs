export function approvedSiteOrigin(env=process.env){
  if(env.CPS_SEO_ENABLED!=='true')return null;
  try{const url=new URL(env.CPS_SITE_ORIGIN);return url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname==='/'&&url.origin===env.CPS_SITE_ORIGIN?url.origin:null;}
  catch{return null;}
}
