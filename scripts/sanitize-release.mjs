// Next emits documented .nft.json manifests. Windows path matching can retain
// development-only files despite configured tracing excludes. Filter those
// references and their generated copies, never the original data directories.
import {readdir,readFile,writeFile,lstat,rm} from 'node:fs/promises';
import {resolve,join,dirname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
const privateNames=['.local-data','.test-pg','reference-demo','evidence','.next-provider-test','.tools','deliverables'];
const inside=(parent,child)=>child===parent||child.startsWith(parent+sep);
export async function sanitizeRelease(projectRoot) {
  const root=resolve(projectRoot),output=join(root,'.next'),standalone=join(output,'standalone');
  if((await lstat(output)).isSymbolicLink()||(await lstat(standalone)).isSymbolicLink())throw new Error('Unexpected release output link; cleanup refused.');
  const sourceRoots=privateNames.map(name=>join(root,name));
  let removedReferences=0;
  async function walk(directory) {
    for(const entry of await readdir(directory,{withFileTypes:true})) {
      const path=join(directory,entry.name);
      if(entry.isSymbolicLink())continue;
      if(entry.isDirectory()) {if(path!==standalone)await walk(path);}
      else if(entry.name.endsWith('.nft.json')) {
        const manifest=JSON.parse(await readFile(path,'utf8'));
        const files=manifest.files.filter(file=>!sourceRoots.some(parent=>inside(parent,resolve(dirname(path),file))));
        removedReferences+=manifest.files.length-files.length;
        if(files.length!==manifest.files.length)await writeFile(path,JSON.stringify({...manifest,files}));
      }
    }
  }
  await walk(output);
  for(const name of privateNames) {
    const target=resolve(standalone,name);
    if(!inside(root,target)||!inside(standalone,target)||target===standalone)throw new Error('Release cleanup escaped its boundary.');
    // Targets are the explicit generated directories above; source copies stay.
    await rm(target,{recursive:true,force:true});
  }
  return {passed:true,removedReferences,excludedDirectories:privateNames};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const result=await sanitizeRelease(process.cwd());
  console.log('Release privacy check:',JSON.stringify(result));
}
