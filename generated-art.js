/* Generated atlases are sampled at runtime; original pixel sprites remain a fallback. */
(()=>{
PixelArt.tile=()=>false;
if(typeof Image==='undefined')return;
const sheets={},base=typeof SpriteAssetBase!=='undefined'?SpriteAssetBase:'assets/art/',fallback=PixelArt.draw;
const sources={champions:'champions-v1.png',units:'units-v1.png',buildings:'buildings-v1.png',terrain:'terrain-v1.png'};
for(const [name,file]of Object.entries(sources)){const image=new Image();image.onload=()=>{sheets[name]=image;if(typeof paintPortraits==='function')paintPortraits();document.querySelectorAll('[data-icon]').forEach(canvas=>{const p=canvas.getContext('2d');p.clearRect(0,0,canvas.width,canvas.height);PixelArt.draw(p,canvas.dataset.icon,24,24,2);});};image.src=base+file;}
const heroes={warden:0,ranger:1,arcanist:2,shade:3},troops={soldier:0,wizardUnit:2},structures={barracks:0,archery:1,wizard:2,merchant:3,tower:4,keep:5};
PixelArt.draw=function(ctx,name,x,y,scale=3,options={}){let sheet,index,cols=4,rows=4;
if(name in structures){sheet=sheets.buildings;index=structures[name];cols=3;rows=2;}
else if(options.troop||name in troops){sheet=sheets.units;const row=name==='ranger'?1:name==='wizardUnit'?2:options.enemy?3:0;const f=options.facing;const direction=f===undefined?0:Math.abs(Math.cos(f))>.7?(Math.cos(f)<0?2:3):(Math.sin(f)<0?1:0);index=row*4+direction;}
else if(name in heroes){sheet=sheets.champions;const f=options.facing;const direction=f===undefined?0:Math.abs(Math.cos(f))>.7?(Math.cos(f)<0?2:3):(Math.sin(f)<0?1:0);index=heroes[name]*4+direction;}
if(!sheet)return fallback(ctx,name,x,y,scale,options);
const sw=sheet.width/cols,sh=sheet.height/rows,size=16*scale*1.35,bob=options.walk?Math.sin((options.walkPhase??0)*Math.PI*4)*.7:0;
ctx.imageSmoothingEnabled=false;ctx.save();if(name in structures&&options.palette?.t==='#b46359')ctx.filter='hue-rotate(190deg)';ctx.drawImage(sheet,(index%cols)*sw,Math.floor(index/cols)*sh,sw,sh,Math.round(x-size/2),Math.round(y-size/2-bob),Math.round(size),Math.round(size));ctx.restore();};
PixelArt.tile=function(ctx,index,x,y,size=32){const image=sheets.terrain;if(!image)return false;const sw=image.width/4,sh=image.height/4;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,index%4*sw,Math.floor(index/4)*sh,sw,sh,x,y,size,size);return true;};
})();
