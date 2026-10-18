/* Dependency-free Render static-site build. Only publish the game and runtime art. */
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname,out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const entrypoints=[...html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)].map(match=>match[1]);
for(const file of ['index.html',...new Set(entrypoints)]){
  if(path.basename(file)!==file)throw Error('Expected a root runtime file: '+file);
  fs.copyFileSync(path.join(root,file),path.join(out,file));
}
const art=path.join(root,'assets','art'),destination=path.join(out,'assets','art');
fs.mkdirSync(destination,{recursive:true});
const images=fs.readdirSync(art).filter(file=>file.endsWith('.png'));
for(const image of images)fs.copyFileSync(path.join(art,image),path.join(destination,image));
console.log('Built Crownfall: '+(new Set(entrypoints).size+1)+' runtime files and '+images.length+' art sheets → dist/');
