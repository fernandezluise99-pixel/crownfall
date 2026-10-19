/* Generated siege sprites, directional firing, and troop animation. */
(()=>{
 const original=PixelArt.draw;
 const effect=PixelArt.effect;
 const sheets={},base=typeof SpriteAssetBase!=='undefined'?SpriteAssetBase:'assets/art/';
 if(typeof Image!=='undefined')for(const [key,file]of Object.entries({workshop:'siege-workshop-v1.png',engine:'siege-engine-v1.png'})){const image=new Image();image.onload=()=>{sheets[key]=image;if(key==='workshop')for(const icon of document.querySelectorAll('[data-icon="siegeWorkshop"]')){const p=icon.getContext('2d');p.clearRect(0,0,icon.width,icon.height);PixelArt.draw(p,'siegeWorkshop',icon.width/2,icon.height/2,2);}};image.src=base+file;}
 PixelArt.effect=function(ctx,kind,x,y,angle,progress,size){if(kind!=='siege')return effect(ctx,kind,x,y,angle,progress,size);if(sheets.engine){ctx.save();ctx.translate(x,y);ctx.rotate((angle||0)+(progress||0)*6);ctx.imageSmoothingEnabled=false;ctx.drawImage(sheets.engine,535,94,80,90,-9,-10,18,20);ctx.restore();return true;}ctx.fillStyle='#3d4547';ctx.fillRect(x-7,y-7,14,14);ctx.fillStyle='#c4c8ac';ctx.fillRect(x-5,y-5,8,6);return true;};
 PixelArt.draw=function(ctx,name,x,y,scale=3,o={}){
   if(name==='siegeWorkshop'){
     if(!sheets.workshop)return original(ctx,'barracks',x,y,scale,o);
     const size=16*scale*1.35;ctx.save();ctx.imageSmoothingEnabled=false;if(o.enemy||o.palette?.t==='#b46359')ctx.filter='hue-rotate(165deg)';ctx.drawImage(sheets.workshop,Math.round(x-size/2),Math.round(y-size/2),size,size);ctx.restore();return;
   }
   if(name==='siege'){
     if(sheets.engine){const image=sheets.engine,f=o.facing??Math.PI/2,col=Math.abs(Math.cos(f))>.7?(Math.cos(f)<0?2:3):(Math.sin(f)<0?1:0),row=o.action==='attack'&&(o.progress||0)>.18?1:0,sw=image.width/4,sh=image.height/2,width=16*scale*1.5,factor=width/sw,bob=o.action==='walk'?Math.sin((o.walkPhase||0)*Math.PI*4):0,recoil=o.action==='attack'?Math.sin((o.progress||0)*Math.PI)*3:0;ctx.save();ctx.imageSmoothingEnabled=false;if(o.enemy||o.palette?.t==='#b46359')ctx.filter='hue-rotate(165deg)';ctx.drawImage(image,col*sw,row*sh,sw,sh,Math.round(x-width/2-Math.cos(f)*recoil),Math.round(y+20-440*factor+bob-Math.sin(f)*recoil),width,sh*factor);ctx.restore();return;}
     ctx.save();ctx.translate(x,y);const color=o.enemy?'#b96d61':'#87b6a6';ctx.fillStyle='#263436';ctx.fillRect(-25,12,12,15);ctx.fillRect(13,12,12,15);ctx.fillStyle='#8d7150';ctx.fillRect(-28,-4,56,22);ctx.fillStyle=color;ctx.fillRect(-20,-12,40,12);ctx.fillStyle='#d2c6a0';ctx.fillRect(-5,-32,10,34);ctx.fillRect(-17,-32,34,7);ctx.restore();return;
   }
   if(!o.troop||!['soldier','ranger','wizardUnit'].includes(name))return original(ctx,name,x,y,scale,o);
   const phase=(o.walkPhase||0)*Math.PI*2,bob=o.action==='walk'?Math.sin(phase*2)*1.5:0;
   ctx.save();ctx.translate(x,y);if(o.action==='attack')ctx.rotate(Math.sin((o.progress||0)*Math.PI)*.1*(Math.cos(o.facing||0)<0?-1:1));
   original(ctx,name,0,bob,scale,{...o,walk:false});
   if(o.action==='walk'){ctx.fillStyle=o.enemy?'#713e40':'#304b45';const stride=Math.sin(phase)*4;ctx.fillRect(-7,12+stride,5,7);ctx.fillRect(3,12-stride,5,7);}
   if(o.action==='attack'){const angle=o.facing||0;ctx.strokeStyle=name==='wizardUnit'?'#c4a3ee':'#eedaa4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(Math.cos(angle)*10,Math.sin(angle)*10);ctx.lineTo(Math.cos(angle)*(24+10*Math.sin((o.progress||0)*Math.PI)),Math.sin(angle)*24);ctx.stroke();}
   ctx.restore();
 };
})();
