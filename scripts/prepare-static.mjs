import fs from 'node:fs/promises';
import path from 'node:path';

// Next's static export emits nested segment payloads, while its client can request
// their dot-joined names. Add aliases so plain static hosting handles both forms.
const root=path.resolve('out');
let count=0;
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){await walk(file);continue;}
  if(!entry.name.endsWith('.txt'))continue;
  const parts=path.relative(root,file).split(path.sep);
  const index=parts.findIndex(p=>p.startsWith('__next.'));
  if(index<0||index===parts.length-1)continue;
  const alias=path.join(root,...parts.slice(0,index),parts.slice(index).join('.'));
  await fs.copyFile(file,alias);count++;
}}
await walk(root);console.log(`Static segment aliases prepared: ${count}`);
