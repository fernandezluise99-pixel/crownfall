/* Generated spell icons and shared, class-specific battlefield animations. */
(()=>{
 'use strict';
 const rows={warden:0,ranger:1,arcanist:2,shade:3},sheets={},base=typeof SpriteAssetBase!=='undefined'?SpriteAssetBase:'assets/art/';let painted=null;
 const legacyIcons=window.CrownfallAbilityIcons;
 function icon(target,id,sheet,sx,sy,sw,sh){const box=$(target);box.innerHTML='<canvas id="'+id+'" class="ability-art" width="64" height="64" aria-hidden="true"></canvas>';const c=$('#'+id).getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(sheet,sx,sy,sw,sh,0,0,64,64);}
 function paint(id,force=false){if(!(id in rows)||painted===id&&!force)return;painted=id;if(sheets.icons){const image=sheets.icons,row=rows[id],tops=[0,.25,.5,.73,1],y=tops[row]*image.height,h=(tops[row+1]-tops[row])*image.height;for(const [i,key]of ['q','e'].entries())icon('#'+key+'Icon',key+'Art',image,i*image.width/2,y,image.width/2,h);}if(sheets.recall)icon('#recall .skill-icon','recallArt',sheets.recall,0,0,sheets.recall.width,sheets.recall.height);}
 window.CrownfallAbilityIcons=id=>{legacyIcons?.(id);paint(id,true);};
 const oldUI=ui;ui=function(){oldUI();paint(selectedHero);};
 PixelArt.abilityEffect=function(ctx,id,key,x,y,progress,radius=120,origin=null,angle=0,opacity=1){const image=sheets.vfx;if(!image||!(id in rows)||!['q','e'].includes(key))return false;const p=Math.max(0,Math.min(.999,progress||0)),row=rows[id]*2+(key==='e'?1:0),frame=Math.min(3,Math.floor(p*4)),sw=image.width/4,sh=image.height/8,size=id==='warden'&&key==='q'?175:id==='arcanist'&&key==='q'?230:id==='shade'&&key==='e'?180:130;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=Math.min(1,(1-p)*3)*opacity;const color=id==='warden'?key==='q'?'#e4be58':'#72e6ab':id==='ranger'?'#8fdd70':id==='arcanist'?'#bd72ff':'#e95080';
  if(key==='q'&&['warden','arcanist'].includes(id)){ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y,radius*p,radius*p*.72,0,0,Math.PI*2);ctx.stroke();}
  if(origin&&Math.hypot(x-origin.x,y-origin.y)>35&&(id==='shade'&&key==='q'||id==='arcanist'&&key==='e')){ctx.strokeStyle=color;ctx.lineWidth=5*(1-p)+1;ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(x,y);ctx.stroke();if(id==='arcanist')ctx.drawImage(image,frame*sw,row*sh,sw,sh,origin.x-50,origin.y-70,100,100);}
  ctx.translate(Math.round(x),Math.round(y-12));if(key==='q'&&(id==='ranger'||id==='shade'))ctx.rotate(angle);ctx.drawImage(image,frame*sw,row*sh,sw,sh,-size/2,-size/2,size,size);ctx.restore();return true;
 };
 PixelArt.abilityProjectile=function(ctx,x,y,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle||0);ctx.fillStyle='#d8ffb3';ctx.fillRect(-24,-1,22,2);ctx.fillStyle='#63b96b';ctx.fillRect(-16,-4,6,8);ctx.fillStyle='#e4f3ef';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-2,-5);ctx.lineTo(-2,5);ctx.closePath();ctx.fill();ctx.restore();};
 PixelArt.recallEffect=function(ctx,x,y,time){ctx.save();ctx.strokeStyle='#64d8ff';ctx.lineWidth=3;ctx.globalAlpha=.65;for(let i=0;i<2;i++){const r=25+((time*26+i*20)%40);ctx.beginPath();ctx.ellipse(x,y+14,r,r*.42,0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<6;i++){const angle=i*Math.PI/3+time;ctx.fillStyle=i%2?'#ffe5a4':'#93edff';ctx.fillRect(Math.round(x+Math.cos(angle)*28),Math.round(y-10-((time*30+i*9)%55)),3,7);}ctx.restore();};
 if(typeof Image!=='undefined')for(const [key,file]of Object.entries({icons:'ability-icons-v1.png',recall:'recall-icon-v1.png',vfx:'ability-vfx-v1.png'})){const image=new Image();image.onload=()=>{sheets[key]=image;paint(selectedHero,true);};image.src=base+file;}
})();
