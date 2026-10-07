// Browser-session fallback when the CLI connector belongs to another account.
// Generates an atomic, fresh-project-only batch from real CLI-generated files.
// History records are written in the same transaction as the executed SQL.
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const after=process.argv[2]==='--after'?process.argv[3]:null;
if(after!==null&&!/^\d{14}$/.test(after))throw new Error('Invalid previous migration version');
const files=(await readdir('supabase/migrations')).filter(name=>/^\d{14}_[a-z_]+\.sql$/.test(name)&&(!after||name.slice(0,14)>after)).sort();
if(!files.length) throw new Error('No generated migrations');
if(new Set(files.map(name=>name.slice(0,14))).size!==files.length) throw new Error('Duplicate migration version');
let batch=after?`begin;
set local lock_timeout='4s';
do $guard$ begin
 if (select max(version) from supabase_migrations.schema_migrations) is distinct from '${after}'
 then raise exception 'Unexpected migration history; review target before applying'; end if;
end $guard$;
`:`begin;
set local lock_timeout='4s';
do $guard$ begin
 if exists(select 1 from pg_tables where schemaname='public')
 or exists(select 1 from auth.users)
 or exists(select 1 from storage.buckets)
 then raise exception 'Dedicated fresh-project inventory required'; end if;
end $guard$;
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations(version text not null primary key);
alter table supabase_migrations.schema_migrations add column if not exists statements text[];
alter table supabase_migrations.schema_migrations add column if not exists name text;
revoke all on schema supabase_migrations from public,anon,authenticated;
revoke all on supabase_migrations.schema_migrations from public,anon,authenticated;
do $guard$ begin
 if exists(select 1 from supabase_migrations.schema_migrations)
 then raise exception 'Migration history already exists; do not replay baseline'; end if;
end $guard$;
`;
const manifest=[];
for(const file of files){
 const sql=await readFile(path.join('supabase/migrations',file),'utf8');
 const body=sql.replace(/^([\s\S]*?)\bbegin;\s*/i,'').replace(/\s*commit;\s*$/i,'');
 if(body===sql||sql.includes('$cps_migration_source$')) throw new Error('Unexpected migration wrapper');
 const version=file.slice(0,14),name=file.slice(15,-4);
 batch+=`\n-- ${file}\n${body}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values('${version}','${name}',array[$cps_migration_source$${sql}$cps_migration_source$]);\n`;
 manifest.push({file,sha256:createHash('sha256').update(sql).digest('hex')});
}
batch+=`commit;
select jsonb_build_object('migration_count',(select count(*) from supabase_migrations.schema_migrations),'table_count',(select count(*) from pg_tables where schemaname='public'),'rls_count',(select count(*) from pg_tables where schemaname='public' and rowsecurity),'bucket_count',(select count(*) from storage.buckets)) as baseline_receipt;
`;
await mkdir('evidence',{recursive:true});
const prefix=after?'dashboard-pending-migrations':'dashboard-migration-batch';
await writeFile(`evidence/${prefix}.sql`,batch);
await writeFile(`evidence/${prefix}-manifest.json`,JSON.stringify({after,files:manifest,batchSha256:createHash('sha256').update(batch).digest('hex')},null,2));
console.log(JSON.stringify({migrations:files.length,output:`evidence/${prefix}.sql`,freshProjectOnly:!after}));
