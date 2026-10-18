/* Offline commanders use the same legal orders and gold costs as a player. */
(()=>{
 'use strict';
 const R=OnlineRules;
 class SkirmishAI{
  constructor(world,tier=2){this.world=world;this.tier=Math.max(0,Math.min(7,tier));this.timers=new Map();this.buildTimers=new Map();for(const p of world.players.slice(1)){const factor=DifficultyLevels[this.tier].stats;p.hp=p.max=Math.round(p.max*factor);p.damage*=factor;}}
  step(dt){const w=this.world,d=DifficultyLevels[this.tier];for(const p of w.players.slice(1)){
   if(p.eliminated)continue;p.gold+=(d.income-1)*dt;
   for(const b of w.buildings)if(b.team===p.team&&b.timer>0)b.timer+=dt*(1-1/d.recruit);
   const timer=(this.timers.get(p.id)||0)-dt;this.timers.set(p.id,timer);if(timer>0)continue;this.timers.set(p.id,Math.min(.5,d.reaction));
   const order=c=>w.command(p.id,c),base=R.BASES[p.team],enemies=w.actors().filter(a=>a.team!==p.team),near=enemies.filter(a=>R.distance(p,a)<550),danger=near.filter(a=>a.type==='tower'||a.type==='king'),troops=w.units.filter(a=>a.team===p.team&&a.type!=='king'&&a.hp>0),support=troops.some(a=>R.distance(p,a)<450);
   while(p.points>0){const key=p.hp/p.max<.5&&p.talents.vitality<8?'vitality':['power','vitality','tempo'].find(k=>p.talents[k]===Math.min(...Object.values(p.talents)));if(!order({type:'talent',key}))break;}
   if(p.level>=5&&p.path===null)order({type:'path',index:p.team%2});
   const buildAt=this.buildTimers.get(p.id)||0;if(w.time>=buildAt){this.buildTimers.set(p.id,w.time+d.build);const own=w.buildings.filter(b=>b.team===p.team&&b.hp>0),sequence=['archery','merchant','wizard','barracks','siege','tower'],kind=sequence[Math.max(0,own.length-2)%sequence.length];let built=false;for(const dx of [-200,0,200])for(const dy of [-180,0,180])if(!built)built=order({type:'build',kind,x:base.x+dx,y:base.y+dy});if(!built&&own.some(b=>b.type==='merchant'&&!b.buildLeft))order({type:'shop',key:(p.shop.blade||0)<2?'blade':'arms'});}
   if(p.hp<=0)continue;
   const retreat=p.hp/p.max<d.retreat||danger.some(a=>R.distance(p,a)<420)&&!support;
   let goal,focus=null,kite=false;
   if(retreat||p.hp/p.max<.85&&R.inside(p,R.FORTS[p.team]))goal={x:base.x+base.dx*120,y:base.y+base.dy*120};
   else{const victim=near.filter(a=>!a.structure&&a.type!=='king').sort((a,b)=>R.distance(p,a)-R.distance(p,b))[0];if(victim){focus=victim.id;if(this.tier>=3&&p.range>100&&R.distance(p,victim)<p.range*.65){goal={x:p.x+(p.x-victim.x),y:p.y+(p.y-victim.y)};kite=true;}}else{const wave=troops.filter(a=>R.distance(a,base)>400).sort((a,b)=>R.distance(p,a)-R.distance(p,b))[0];const king=enemies.filter(a=>a.type==='king').sort((a,b)=>R.distance(p,a)-R.distance(p,b))[0];goal=wave||king||R.CENTER;if(!support&&R.distance(p,base)<650)goal={x:base.x+base.dx*380,y:base.y+base.dy*380};}}
   const escape=kite?R.route(p,goal):null,delta=escape?R.distance(p,escape)||1:1;order({type:'input',dx:escape?(escape.x-p.x)/delta:0,dy:escape?(escape.y-p.y)/delta:0,target:goal?{x:goal.x,y:goal.y}:null,focus:retreat?null:focus,mode:retreat?'move':'attack'});
   if(d.skills){if(near.some(a=>!a.structure&&a.type!=='king'&&R.distance(p,a)<(p.hero==='ranger'||p.hero==='arcanist'?360:165)))order({type:'ability',key:'q'});if((p.hero==='warden'||p.hero==='shade')?p.hp<p.max*.65:near.length>0)order({type:'ability',key:'e'});}
  }}
 }
 window.CrownfallSkirmishAI=SkirmishAI;
})();
