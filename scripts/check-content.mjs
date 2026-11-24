import fs from 'node:fs/promises';
const errors=[],assets=new Set();
const projects=JSON.parse(await fs.readFile('src/data/projects.json','utf8'));
const experiences=JSON.parse(await fs.readFile('src/data/experiences.json','utf8'));
const gallery=JSON.parse(await fs.readFile('src/data/gallery.json','utf8'));
if(!projects.length||!gallery.length)errors.push('Projects and gallery must contain at least one entry.');
const slugs=new Set();for(const p of projects){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug))errors.push(`Invalid or duplicate project slug: ${p.slug}`);slugs.add(p.slug);if(!p.title?.trim()||!p.description?.trim())errors.push(`Missing project text: ${p.slug}`);assets.add(p.img);}
for(const p of gallery){if(!p.alt?.trim())errors.push(`Missing gallery alt: ${p.src}`);assets.add(p.src);}
for(const entry of experiences)assets.add(entry.logo);
for(const file of ['site.ts','portfolio.ts']){const text=await fs.readFile(`src/data/${file}`,'utf8');for(const m of text.matchAll(/["'](\/[^"']+\.(?:svg|webp|png|jpe?g|avif|pdf))["']/g))assets.add(m[1]);}
for(const file of assets){if(!file?.startsWith('/')||file.includes('..')){errors.push(`Use a local public asset: ${file}`);continue;}try{await fs.access('public'+file);}catch{errors.push(`Missing asset: public${file}`);}}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Content OK: ${projects.length} projects, ${gallery.length} gallery photos, ${assets.size} local assets.`);
