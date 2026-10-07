// Deployment-approved sharing of DRAFTS only. Never issuance/payment/fulfilment.
export function documentPolicy(env=process.env){
 if(env.CPS_DOCUMENT_VISIBILITY_ENABLED!=='true')return null;
 try{const p=JSON.parse(env.CPS_DOCUMENT_POLICY_JSON??'');if(!p||typeof p.reference!=='string'||!p.reference.trim()||p.reference.length>100||!p.allow||Object.keys(p.allow).some(k=>!['order','invoice','tracking'].includes(k))||Object.values(p.allow).some(v=>typeof v!=='boolean'))return null;const kinds=['order','invoice','tracking'].filter(k=>p.allow[k]===true);return kinds.length?{reference:p.reference.trim(),kinds}:null;}catch{return null;}
}
