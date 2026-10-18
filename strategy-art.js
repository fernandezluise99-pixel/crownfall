/* Troop animation and original code-native siege silhouettes. */
(()=>{
 const original=PixelArt.draw;
 const effect=PixelArt.effect;
 PixelArt.effect=function(ctx,kind,x,y,angle,progress,size){if(kind!=='siege')return effect(ctx,kind,x,y,angle,progress,size);ctx.fillStyle='#3d4547';ctx.fillRect(x-7,y-7,14,14);ctx.fillStyle='#c4c8ac';ctx.fillRect(x-5,y-5,8,6);return true;};
 PixelArt.draw=function(ctx,name,x,y,scale=3,o={}){
   if(name==='siege'){
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
