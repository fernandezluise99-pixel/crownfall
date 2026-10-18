/* Layout, fortification collision, and environment rendering. */
const Battlefield=(()=>{
const forts=[{team:0,left:260,right:1420,top:2520,bottom:3280,front:2520,inward:1},{team:1,left:260,right:1420,top:80,bottom:840,front:840,inward:-1}];
const gateX=840,gateHalf=112;
const walls=forts.flatMap(f=>[{x:f.left-16,y:f.top-16,w:32,h:f.bottom-f.top+32},{x:f.right-16,y:f.top-16,w:32,h:f.bottom-f.top+32},{x:f.left,y:(f.inward===1?f.bottom:f.top)-16,w:f.right-f.left,h:32},{x:f.left,y:f.front-16,w:gateX-gateHalf-f.left,h:32},{x:gateX+gateHalf,y:f.front-16,w:f.right-gateX-gateHalf,h:32}]);
const inside=(p,f)=>p.x>f.left+16&&p.x<f.right-16&&p.y>f.top+16&&p.y<f.bottom-16;
const crossings=[{x:364,half:64},{x:840,half:140},{x:1316,half:64}];
function blocked(x,y,r=13){const river=y+r>1640&&y-r<1704&&!crossings.some(b=>Math.abs(x-b.x)<b.half-r);return river||walls.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h);}
function move(actor,x,y){const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x-actor.x),Math.abs(y-actor.y))/8)),dx=(x-actor.x)/steps,dy=(y-actor.y)/steps;for(let i=0;i<steps;i++){if(!blocked(actor.x+dx,actor.y))actor.x+=dx;if(!blocked(actor.x,actor.y+dy))actor.y+=dy;}}
function route(actor,destination){const exit=forts.find(f=>inside(actor,f)&&!inside(destination,f));if(!exit&&((actor.y>1704&&destination.y<1640)||(actor.y<1640&&destination.y>1704)||actor.y>=1640&&actor.y<=1704)){const bridge=crossings.reduce((best,b)=>Math.abs(actor.x-b.x)<Math.abs(actor.x-best.x)?b:best,crossings[0]),south=actor.y>1672;if(Math.abs(actor.x-bridge.x)>bridge.half-25)return {x:bridge.x,y:south?1790:1550};return {x:bridge.x,y:destination.y>1672?1790:1550};}const f=exit||forts.find(f=>!inside(actor,f)&&inside(destination,f));if(f){const a=inside(actor,f);if(Math.abs(actor.x-gateX)>gateHalf-30)return {x:gateX,y:f.front+(a?f.inward:-f.inward)*100};return {x:gateX,y:f.front+(a?-f.inward:f.inward)*80};}return destination;}
const props=[];let seed=723;function random(){seed=(seed*16807)%2147483647;return seed/2147483647;}
// Side groves leave the main road, gates and build courtyards clear.
for(let i=0;i<180;i++){const side=i%2,x=side?1110+random()*500:70+random()*500,y=920+random()*1500;if(Math.abs(y-1670)<110)continue;props.push({index:i%4,x,y,size:90+random()*48});}
for(let i=0;i<60;i++){const x=100+random()*1480,y=930+random()*1480;if(Math.abs(x-840)<210||Math.abs(y-1670)<110)continue;props.push({index:i<20?4+i%4:i<40?10+i%4:14+i%2,x,y,size:38+random()*24});}
for(let i=0;i<36;i++){const x=80+random()*1520;if(x>650&&x<1030)continue;props.push({index:i%2?8:9,x,y:i%2?1580+random()*25:1740+random()*25,size:48});}
props.sort((a,b)=>a.y-b.y);
function load(){if(typeof Image==='undefined')return {};const assets={};for(const key of ['foliage','fortifications']){const image=new Image();image.onload=()=>assets[key]=image;image.src='assets/art/'+key+'-v1.png';}return assets;}
const assets=load();
function prop(ctx,key,index,x,y,width,height=width){const image=assets[key];if(!image)return false;const sw=image.width/4,sh=image.height/4;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,index%4*sw,Math.floor(index/4)*sh,sw,sh,Math.round(x-width/2),Math.round(y-height*.78),width,height);return true;}
function tile(ctx,index,x,y,size){if(!PixelArt.tile(ctx,index,x,y,size)){ctx.fillStyle=index===8?'#7e8a79':'#697c5d';ctx.fillRect(x,y,size,size);}}
function terrain(ctx,camera,VW,VH){
const size=64;
for(let y=Math.floor(camera.y/size)*size;y<camera.y+VH;y+=size)for(let x=Math.floor(camera.x/size)*size;x<camera.x+VW;x+=size){const n=(x/size*17+y/size*31)%19;tile(ctx,n===4?1:n===11?2:0,x,y,size);}
// Textured north/south road, rather than a flat color under the scenery.
for(let y=Math.max(0,Math.floor(camera.y/64)*64);y<Math.min(3360,camera.y+VH);y+=64)for(let x=744;x<936;x+=64)tile(ctx,4,x,y,64);
// Approach roads follow the active map's crossings, including the two-lane narrows.
if(camera.y<2040&&camera.y+VH>1320)for(const bridge of crossings){for(let y=1344;y<2040;y+=32){if(y<camera.y-32||y>camera.y+VH)continue;const blend=Math.min(1,Math.max(0,(y<1672?y-1344:2040-y)/224)),x=840+(bridge.x-840)*blend;for(let offset=-32;offset<=32;offset+=32)tile(ctx,4,Math.round(x/32)*32+offset,y,32);}}
// Riverbanks and crossings match the movement collision geometry.
if(camera.y<1768&&camera.y+VH>1576){for(let x=0;x<1680;x+=64){tile(ctx,14,x,1608,32);tile(ctx,10,x,1640,64);tile(ctx,14,x,1704,32);}for(const b of crossings){for(let x=b.x-b.half;x<b.x+b.half;x+=32)for(let y=1640;y<1704;y+=32)tile(ctx,12,x,y,32);}}
ground(ctx,camera,VW,VH);
}
function ground(ctx,camera,VW,VH){for(const f of forts){if(f.bottom<camera.y||f.top>camera.y+VH)continue;
// The paving fills a protected bailey, inset from the walls, with garden corners.
ctx.save();ctx.beginPath();ctx.rect(f.left+24,f.top+24,f.right-f.left-48,f.bottom-f.top-48);ctx.clip();
for(let y=f.top+24;y<f.bottom-24;y+=80)for(let x=f.left+24;x<f.right-24;x+=80){const garden=(x<420||x>1240)&&(y<f.top+125||y>f.bottom-175);tile(ctx,garden?1:8,x,y,80);}
ctx.restore();
for(let y=f.top+45;y<f.bottom-45;y+=24){ctx.fillStyle=f.team?'#844e4c':'#39757a';ctx.fillRect(820,y,40,20);}
// Healing sanctuary is on the road inside the gate; it doesn't block the king or recruits.
const sy=f.team?500:2860;ctx.strokeStyle=f.team?'#bd7868':'#84c5af';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(840,sy,142,105,0,0,Math.PI*2);ctx.stroke();prop(ctx,'fortifications',12,1000,sy+20,82);}
for(let y=1060;y<2350;y+=64)for(const x of [620,1020])if(Math.abs(y-1670)>140)tile(ctx,14,x,y,32);
}
function scenery(ctx,camera,VW,VH){for(const p of props){if(p.x<camera.x-100||p.x>camera.x+VW+100||p.y<camera.y-100||p.y>camera.y+VH+100)continue;if(!prop(ctx,'foliage',p.index,p.x,p.y,p.size)){ctx.fillStyle='#315440';ctx.fillRect(p.x-14,p.y-26,28,28);}}}
function rampart(ctx,x,y,vertical=false){if(!prop(ctx,'fortifications',vertical?1:0,x,y,vertical?52:78,vertical?78:52)){ctx.fillStyle='#9ca58c';ctx.fillRect(x-(vertical?14:36),y-18,vertical?28:72,vertical?72:28);}}
function fortifications(ctx,camera,VW,VH){for(const f of forts){if(f.bottom<camera.y-100||f.top>camera.y+VH+100)continue;for(let y=f.top+48;y<f.bottom;y+=54){rampart(ctx,f.left,y,true);rampart(ctx,f.right,y,true);}for(let x=f.left+40;x<f.right;x+=60){const rear=f.inward===1?f.bottom:f.top;rampart(ctx,x,rear);if(Math.abs(x-gateX)>gateHalf+15)rampart(ctx,x,f.front);}for(const x of [f.left,f.right])for(const y of [f.top,f.bottom])prop(ctx,'fortifications',6,x,y,92);for(const x of [gateX-gateHalf-12,gateX+gateHalf+12]){prop(ctx,'fortifications',7,x,f.front,82);prop(ctx,'fortifications',f.team?11:10,x,f.front-8,50);}for(const x of [gateX-160,gateX+160])prop(ctx,'fortifications',13,x,f.front+f.inward*80,40);}}
return {forts,walls,crossings,inside,blocked,move,route,terrain,ground,scenery,fortifications,prop};})();
