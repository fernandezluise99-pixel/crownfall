/* Four-frame directional walk/attack animations and combat VFX. */
(()=>{
const fallback=PixelArt.draw,sheets={},base=typeof SpriteAssetBase!=='undefined'?SpriteAssetBase:'assets/art/';
PixelArt.effect=()=>false;
if(typeof Image==='undefined')return;
for(const key of ['warden','ranger','arcanist','shade','effects']){const image=new Image();image.onload=()=>{sheets[key]=image;};image.src=base+key+'-animation-v1.png';if(key!=='effects'){const walk=new Image();walk.onload=()=>{sheets[key+'Walk']=walk;};walk.src=base+key+'-walk-v2.png';}}
PixelArt.draw=function(ctx,name,x,y,scale=3,options={}){const attack=options.action==='attack',walkSheet=sheets[name+'Walk'],sheet=!attack&&walkSheet?walkSheet:sheets[name];if(!sheet||options.troop||!options.action)return fallback(ctx,name,x,y,scale,options);const f=options.facing??Math.PI/2,direction=Math.abs(Math.cos(f))>.7?(Math.cos(f)<0?2:3):(Math.sin(f)<0?1:0);const columns=!attack&&walkSheet?8:4,rows=!attack&&walkSheet?4:8;
const phase=options.walkPhase??(options.time||0)*1.125;const frame=attack?Math.min(3,Math.floor(clampFrame(options.progress)*4)):options.action==='walk'?Math.floor(phase*columns)%columns:0;
const row=direction+(attack?4:0),sw=sheet.width/columns,sh=sheet.height/rows,size=16*scale*1.35;
const key=!attack&&walkSheet?name+'Walk':name,registration=typeof SpriteRegistration!=='undefined'?SpriteRegistration[key]:null,anchor=registration?.frames[row*columns+frame];
ctx.imageSmoothingEnabled=false;if(anchor){const factor=16*scale*1.15/registration.bodyHeight,drawW=sw*factor,drawH=sh*factor;ctx.drawImage(sheet,frame*sw,row*sh,sw,sh,Math.round(x-anchor.x*factor),Math.round(y+16*scale*.32-anchor.y*factor),drawW,drawH);}else ctx.drawImage(sheet,frame*sw,row*sh,sw,sh,Math.round(x-size/2),Math.round(y-size/2),Math.round(size),Math.round(size));};
function clampFrame(n){return Math.max(0,Math.min(.999,n||0));}
PixelArt.effect=function(ctx,kind,x,y,angle,progress,size=56){const sheet=sheets.effects;if(!sheet)return false;const row={warden:0,ranger:1,arcanist:2,shade:3}[kind]??2;const sw=sheet.width/4,sh=sheet.height/4,frame=Math.min(3,Math.floor(clampFrame(progress)*4));ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle||0);ctx.imageSmoothingEnabled=false;ctx.drawImage(sheet,frame*sw,row*sh,sw,sh,-size/2,-size/2,size,size);ctx.restore();return true;};
})();
