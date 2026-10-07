// Next standalone needs public and static assets copied separately.
import {cp,lstat,mkdir,readdir} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
const root=resolve(process.cwd()),output=join(root,'.next','standalone');
if((await lstat(output)).isSymbolicLink())throw new Error('Unexpected standalone output link.');
async function noLinks(directory){for(const entry of await readdir(directory,{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error('Unexpected asset link.');if(entry.isDirectory())await noLinks(join(directory,entry.name));}}
for(const [source,target] of [[join(root,'public'),join(output,'public')],[join(root,'.next','static'),join(output,'.next','static')]]){
 if(!target.startsWith(output+sep))throw new Error('Release asset path escaped output.');
 await noLinks(source);await mkdir(target,{recursive:true});await noLinks(target);await cp(source,target,{recursive:true});
}
console.log('Standalone public/static assets packaged; no fixtures or environment files copied.');
