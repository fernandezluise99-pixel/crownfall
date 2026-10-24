/* Verify the deployed runtime and artwork against the local build. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=process.argv[2];if(!base||!base.startsWith('https://'))throw Error('HTTPS site URL required');
async function main(){const pages=['index.html','last-light.html'],runtime=pages.flatMap(page=>[...fs.readFileSync(path.join(__dirname,'dist',page),'utf8').matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)].map(m=>m[1]));const files=[...pages,...new Set(runtime),...fs.readdirSync(path.join(__dirname,'dist/assets/art')).filter(f=>/\.(png|jpg)$/.test(f)).map(f=>'assets/art/'+f)];
const selected=process.argv.includes('--code-only')?files.filter(file=>!file.endsWith('.png')):files;
for(let offset=0;offset<selected.length;offset+=4){await Promise.all(selected.slice(offset,offset+4).map(async file=>{const response=await fetch(new URL(file,base+'/'),{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(file+' HTTP '+response.status);const actual=Buffer.from(await response.arrayBuffer()),expected=fs.readFileSync(path.join(__dirname,'dist',file));const hash=b=>crypto.createHash('sha256').update(b).digest('hex');if(hash(actual)!==hash(expected))throw Error('Deployed file differs: '+file);}));}
console.log('PASS: '+selected.length+' deployed '+(process.argv.includes('--code-only')?'HTML, JavaScript, and CSS':'HTML, JavaScript, CSS, and PNG/JPEG')+' files match the local build byte-for-byte.');}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
