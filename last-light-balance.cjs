/* Baseline legal-action policy for repeatable prototype tuning, not game AI. */
const R=require('./last-light-core.js'),D=require('./last-light-data.js');
function candidates(b){const s=b.s,options=[],push=(c,value)=>options.push({c,value}),urgency=e=>e.pos==='breach'?3:D.enemies[e.key].support?1.5:1;
 for(let slot=0;slot<5;slot++)for(const e of s.enemies)if(b.canFire(slot,e.id)){const w=s.weapons[slot],d=D.cards[w.key],damage=Math.max(0,d.damage+(w.mod?2:0)-Math.max(0,D.enemies[e.key].armor-(d.pierce||0)-(w.mod?1:0)));push({type:'fire',slot,target:e.id},(Math.min(e.hp,damage)+(damage>=e.hp?7:0))*urgency(e)/d.fire);}
 if(s.ap>0&&!s.bashUsed)for(const e of s.enemies)if(e.pos==='breach')push({type:'bash',target:e.id},(Math.min(2,e.hp)+(e.hp<=2?7:0))*urgency(e));
 for(const c of s.hand){const d=D.cards[c.key];if(d.cost>s.ap)continue;const targets=['weapon','reload','mod','repair','fortify','rebuild','blast','laneStun'].includes(d.type)?[0,1,2,3,4]:['attack','stun'].includes(d.type)?s.enemies.map(e=>e.id):[null];for(const target of targets){if(!b.legal(c,target))continue;const l=b.lane(target),w=b.weapon(target),e=b.enemy(target),at=s.enemies.filter(e=>e.lane===target);let value=0;
  if(d.type==='weapon'){const deployed=s.weapons.filter(Boolean).length;if(w)continue;value=(d.reach?deployed===0?0:4:deployed===0?20:deployed===1?13:deployed===2?7:3);}
  if(d.type==='reload')value=(D.cards[w.key].ammo-w.ammo)*(w.key==='revolver'?2.3:2)+(w.fired?0:2);
  if(d.type==='repair')value=Math.min(d.heal,l.max-l.hp)*(at.length?1.1:.15);
  if(d.type==='fortify')value=((3-l.armor)*2+d.heal)*(at.length?1:.3);
  if(d.type==='rebuild')value=at.length?d.heal+5:2;
  if(d.type==='attack'){const damage=Math.max(0,d.damage-Math.max(0,D.enemies[e.key].armor-(d.pierce||0)));value=(Math.min(e.hp,damage)+(damage>=e.hp?7:0))*urgency(e);}
  if(d.type==='blast')value=at.reduce((n,e)=>n+(Math.min(d.damage,e.hp)+(e.hp<=d.damage?7:0))*urgency(e),0);
  if(d.type==='stun')value=e.stun?0:(D.enemies[e.key].attack*d.turns*.8)*urgency(e);
  if(d.type==='laneStun')value=at.reduce((n,e)=>n+(e.stun?0:D.enemies[e.key].attack*d.turns*.8*urgency(e)),0);
  if(d.type==='mod')value=(w.fired?4:9)+(D.cards[w.key].fire===1?3:0);
  if(d.type==='tempo')value=s.turn<8?12:s.turn<15?5:0;
  if(d.type==='draw')value=s.hand.length<4?6:1;
  if(d.type==='heal')value=Math.min(d.heal,50-s.hp)*(s.hp<20?2:.8);
  if(value>0)push({type:'play',id:c.id,target},value/Math.max(1,d.cost));
 }}return options.sort((a,b)=>b.value-a.value);}
function play(seed,mission=0,ally='mechanic'){const b=new R.Battle({seed,mission,ally});for(let turn=0;turn<150&&b.s.status==='playing';turn++){for(let i=0;i<60&&b.s.status==='playing';i++){const action=candidates(b)[0];if(!action)break;const result=b.command(action.c);if(!result.ok)throw Error(result.error);}if(b.s.status==='playing')b.command({type:'end'});}return b;}
if(require.main===module){for(const ally of ['mechanic','scout'])for(let mission=0;mission<3;mission++){let wins=0,turns=0,hp=0;for(let seed=1;seed<=100;seed++){const b=play(seed,mission,ally);if(b.s.status==='victory'){wins++;hp+=b.s.hp;}turns+=b.s.turn;}console.log(JSON.stringify({ally,mission:mission+1,seeds:100,wins,avgTurns:turns/100,winHP:wins?Math.round(hp/wins):0}));}}
module.exports={play,candidates};
