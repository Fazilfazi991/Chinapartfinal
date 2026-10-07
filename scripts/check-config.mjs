import nextEnv from '@next/env';
import {inspectConfiguration} from '../lib/config.mjs';
const production=process.argv.includes('--production');
nextEnv.loadEnvConfig(process.cwd(),!production,{info(){},error(){}});
const env={...process.env,NODE_ENV:production?'production':process.env.NODE_ENV||'development'};
const report=inspectConfiguration(env);
const blocking=report.issues.filter(issue=>issue.severity==='error'&&(issue.section==='public'||issue.section==='flags'||issue.section==='auth'&&issue.code!=='missing'||(env.CPS_SUBMISSIONS_ENABLED==='true'||env.CPS_VENDOR_SUBMISSIONS_ENABLED==='true')&&['auth','persistence','submissions'].includes(issue.section)||env.CPS_SUBMISSIONS_ENABLED==='true'&&env.CPS_UPLOADS_ENABLED==='true'&&issue.section==='uploads'));
console.log(JSON.stringify({...report,blockingIssues:blocking,offlineOnly:true},null,2));
if(blocking.length||process.argv.includes('--require-submissions')&&!report.submissionsReady)process.exitCode=1;
