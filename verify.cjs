const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
function node(id) { if (!nodes.has(id)) nodes.set(id, {style:{},classList:{toggle(){}},setAttribute(){},appendChild(){},textContent:'',innerHTML:'',dataset:{},addEventListener(){},focus(){},getContext(){return new Proxy({}, {get:(target,key)=>target[key]??(()=>{})});}}); return nodes.get(id); }
const sandbox = {document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>node(Symbol()),addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},console};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('generated-art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('sprite-registration.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('animation-art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('environment.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('enemy-ai.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`
begin(); build('barracks');
if(placing!=='barracks')throw Error('Building selection');
const initialBuildings=buildings.length;
if(!placeBuilding(1560,4680))throw Error('Building placement');
if(HOME.x!==ENEMY.x || HOME.y<=ENEMY.y || H<=W) throw Error('Vertical map layout');
for(let n=0;n<6;n++){const pos=site(n);if(pos.x<40||pos.x>W-40||pos.y<40||pos.y>H-40)throw Error('Build site outside map');}
if(W!==2520||H!==5040||VW!==1260||VH!==800)throw Error('MOBA viewport and vertical world');
if(buildings.length!==initialBuildings+1 || gold!==100) throw Error('Construction cost');
if(canPlace(HOME.x,HOME.y)||canPlace(ENEMY.x,ENEMY.y))throw Error('Invalid placement accepted');
draw();
const oldY=hero.y; keys.add('w'); step(.1); keys.clear();
if(hero.y>=oldY) throw Error('Top-down vertical movement');
const oldX=hero.x; keys.add('d'); step(.1); keys.clear();
if(hero.x<=oldX) throw Error('Top-down horizontal movement');
hero.y=1600;updateCamera();if(camera.y<=0||camera.y>H-VH)throw Error('Scrolling camera');
hero.y=4540;
step(1.1); if(!units.some(u=>u.team===0&&u.type==='soldier')) throw Error('Recruitment');
hero.hp=100; ability('e'); if(hero.hp!==180 || hero.e!==18) throw Error('Healing');
const enemy=unit(1,'soldier',hero.x+10,hero.y); units.push(enemy); ability('q');
if(enemy.hp>=110 || hero.q!==7) throw Error('Shockwave');
gold=2000;build('forge');if(forge!==0)throw Error('Merchant prerequisite');
build('merchant');if(!placeBuilding(1560,4880))throw Error('Merchant placement');
build('forge');if(forge!==1)throw Error('Equipment upgrade');
const caster=unit(0,'wizard',900,1500), splashA=unit(1,'soldier',900,1550),splashB=unit(1,'soldier',920,1550);
units.push(caster,splashA,splashB);attack(caster,splashA);stepProjectiles(.2);stepProjectiles(.5);if(splashB.hp>=splashB.max)throw Error('Wizard splash');
build('wizard');if(!placeBuilding(960,4480))throw Error('Wizard building');
step(2);if(!units.some(u=>u.type==='wizard'&&u.team===0))throw Error('Wizard recruitment');
const victim=buildings.find(b=>b.team===1);hit(hero,victim,10000);step(.1);
if(buildings.includes(victim))throw Error('Destroyed building retained');
hero.x=300;hero.y=1700;ability('b');for(let i=0;i<31;i++)step(.1);
if(dist(hero,HOME)>200)throw Error('Recall');
hero.hp=0; hero.respawn=0; step(.1); for(let i=0;i<90;i++) step(.1);
if(hero.hp<=0) throw Error('Respawn');
reset(); begin(); units.find(u=>u.team===1&&u.type==='king').hp=0; step(.01);
if(!ended) throw Error('Victory');
reset(); begin(); units.find(u=>u.team===0&&u.type==='king').hp=0; step(.01);
if(!ended) throw Error('Defeat');
reset(); begin(); togglePause(); const time=clock; step(1); if(clock!==time) throw Error('Pause');
reset(); begin(); for(let i=0;i<12000&&!ended;i++) step(.05);
draw();if(buildings.filter(b=>b.team===1).length<=2&&!ended)throw Error('Enemy base expansion');
if(!Number.isFinite(gold)||units.some(u=>!Number.isFinite(u.x)||!Number.isFinite(u.hp))) throw Error('Invalid simulation state');
console.log('PASS: world scale, camera, placement, merchant prerequisite, equipment, wizard splash and recruitment, destructible buildings, recall, enemy expansion, combat, respawn, victory/defeat, 10-minute simulation');
for(const id of Object.keys(champions)){
reset();chooseHero(id);begin();
if(hero.max!==champions[id].hp||hero.range!==champions[id].range)throw Error('Hero stats '+id);
const victim=unit(1,'soldier',hero.x,hero.y-80);units.push(victim);hero.facing=-Math.PI/2;
ability('q');if(hero.q<=0)throw Error('Hero Q '+id);
stepProjectiles(.2);stepProjectiles(.8);
if(id!=='shade'&&victim.hp>=victim.max)throw Error('Hero Q damage '+id);
hero.hp=100;const before={x:hero.x,y:hero.y};ability('e');if(hero.e<=0)throw Error('Hero E '+id);
if(id==='warden'&&hero.hp!==180)throw Error('Warden healing');
if(id==='ranger'&&hero.boost!==5)throw Error('Ranger quickdraw');
if(id==='arcanist'&&dist(hero,before)<200)throw Error('Arcanist blink');
draw();step(.1);if(!Number.isFinite(hero.hp))throw Error('Hero state '+id);
}
reset();chooseHero('shade');begin();hero.hp=100;units.push(unit(1,'soldier',hero.x+20,hero.y));ability('e');if(hero.hp!==140)throw Error('Shade siphon');
console.log('PASS: all four champions, distinct stats, abilities, sprite rendering, portrait UI');
`,sandbox);
assert.ok(nodes.get('#clock').textContent);
const markup=fs.readFileSync('index.html','utf8');
for(const match of fs.readFileSync('game.js','utf8').matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g))assert.ok(markup.includes('id="'+match[1]+'"'),'Missing HUD element '+match[1]);
assert.ok(markup.indexOf('src="art.js"')<markup.indexOf('src="game.js"'),'Sprite library must load first');
vm.runInContext(`for(const group of [PixelArt.sprites,PixelArt.buildings])for(const [name,rows]of Object.entries(group))if(rows.length!==16||rows.some(row=>row.length!==16))throw Error('Sprite dimensions '+name);`,sandbox);
console.log('PASS: HUD element wiring, script order, 16x16 sprite dimensions');
for(const name of ['champions','units','buildings','terrain']){const png=fs.readFileSync('assets/art/'+name+'-v1.png');assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');assert.ok(png.readUInt32BE(16)>0);}
for(const name of ['warden','ranger','arcanist','shade','effects']){const png=fs.readFileSync('assets/art/'+name+'-animation-v1.png');assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');const aspect=png.readUInt32BE(16)/png.readUInt32BE(20);assert.ok(Math.abs(aspect-(name==='effects'?1:.5))<.02,'Animation grid aspect '+name);}
const atlasCalls=[];
const atlasContext={Image:class{constructor(){this.width=1254;this.height=1254;}set src(value){this.path=value;this.onload();}},document:{querySelectorAll:()=>[]}};
vm.createContext(atlasContext);vm.runInContext(fs.readFileSync('art.js','utf8'),atlasContext);vm.runInContext(fs.readFileSync('generated-art.js','utf8'),atlasContext);
atlasContext.drawCalls=atlasCalls;vm.runInContext(`const testCtx={save(){},restore(){},drawImage(image,...args){drawCalls.push({path:image.path,args});}};PixelArt.draw(testCtx,'warden',0,0,4,{facing:-Math.PI/2});PixelArt.draw(testCtx,'ranger',0,0,3,{troop:true,facing:0});PixelArt.draw(testCtx,'keep',0,0,8);PixelArt.tile(testCtx,10,0,0,64);`,atlasContext);
assert.equal(atlasCalls.length,4);assert.ok(atlasCalls[0].path.includes('champions'));assert.equal(atlasCalls[0].args[0],1254/4);assert.ok(atlasCalls[1].path.includes('units'));assert.ok(atlasCalls[2].path.includes('buildings'));assert.ok(atlasCalls[3].path.includes('terrain'));
console.log('PASS: generated PNG assets, atlas loading, directional hero and troop mapping, buildings and terrain');
vm.runInContext(fs.readFileSync('animation-art.js','utf8'),atlasContext);
vm.runInContext(`testCtx.translate=()=>{};testCtx.rotate=()=>{};PixelArt.draw(testCtx,'warden',0,0,4,{action:'walk',time:.15,facing:-Math.PI/2});PixelArt.draw(testCtx,'ranger',0,0,4,{action:'attack',progress:.8,facing:0});PixelArt.effect(testCtx,'arcanist',0,0,1,.6,48);`,atlasContext);
assert.ok(atlasCalls[4].path.includes('warden-walk-v2'));assert.equal(atlasCalls[4].args[0],1254/8);assert.equal(atlasCalls[4].args[1],1254/4);
assert.ok(atlasCalls[5].path.includes('ranger-animation'));assert.equal(atlasCalls[5].args[0],1254/4*3);assert.equal(atlasCalls[5].args[1],1254/8*7);
assert.ok(atlasCalls[6].path.includes('effects-animation'));
vm.runInContext(`reset();chooseHero('ranger');begin();const targetUnit=unit(1,'soldier',hero.x,hero.y-200);units.push(targetUnit);attack(hero,targetUnit);if(targetUnit.hp!==targetUnit.max||hero.attackAnim<=0)throw Error('Attack must wind up');stepProjectiles(.1);if(targetUnit.hp!==targetUnit.max)throw Error('Early projectile hit');stepProjectiles(.11);stepProjectiles(.05);if(projectiles.length===0||targetUnit.hp!==targetUnit.max)throw Error('Projectile must travel');stepProjectiles(.5);if(targetUnit.hp>=targetUnit.max)throw Error('Projectile impact damage');reset();begin();keys.add('w');step(.05);if(!hero.moving)throw Error('Walk state missing');keys.clear();step(.05);if(hero.moving)throw Error('Idle must not walk');const oldClock=clock;togglePause();step(1);if(clock!==oldClock)throw Error('Paused animation clock');`,sandbox);
console.log('PASS: walk/attack frame and direction sampling, VFX frames, delayed traveling projectiles, real movement/idle state, paused animation');
vm.runInContext(`
{reset();chooseHero('warden');begin();hero.hp=100;const initialHP=hero.max,initialATK=hero.damage,initialGold=gold;
gainXP(xpNeeded()+10);if(level!==2||xp!==10||skillPoints!==1||hero.max<=initialHP||hero.damage<=initialATK||hero.hp<=100||gold<=initialGold)throw Error('Level rewards / overflow');
if(!spendPoint('vitality')||talents.vitality!==1||skillPoints!==0||hero.armor<=0)throw Error('Talent purchase');
if(spendPoint('power')||spendPoint('unknown'))throw Error('Talent overspend');
gainXP(1000);if(level<5||hero.armor<.02||skillPoints<3)throw Error('Multi-level / Warden milestone');
const retainedLevel=level,retainedTalents=talents.vitality;hero.hp=0;hero.respawn=1;step(1.1);if(level!==retainedLevel||talents.vitality!==retainedTalents||hero.hp<=0)throw Error('Death retains progression');
gainXP(1000000);if(level!==20||xp!==0)throw Error('Level cap');const priorPoints=skillPoints;gainXP(1000);if(skillPoints!==priorPoints)throw Error('Cap grants extra points');
while(spendPoint('tempo')){}if(talents.tempo>8||cooldownMultiplier()<.55)throw Error('Talent / cooldown cap');
reset();begin();const victim=unit(1,'soldier',hero.x,hero.y-30);hit(hero,victim,10000);const earned=totalEarnedXP;hit(hero,victim,10000);if(totalEarnedXP!==earned||earned!==30)throw Error('Duplicate kill XP');
const victim2=unit(1,'soldier',hero.x,hero.y-30);hit(hero,victim2,10000);if(chain!==2||totalEarnedXP!==63)throw Error('Kill chain');
const ally=unit(0,'soldier',hero.x,hero.y),assist=unit(1,'archer',hero.x,hero.y);hit(hero,assist,1);hit(ally,assist,10000);if(totalEarnedXP!==79)throw Error('Assist XP');
const untagged=unit(1,'soldier',hero.x,hero.y);hit(ally,untagged,10000);if(totalEarnedXP!==79)throw Error('Idle army XP');
const expired=unit(1,'soldier',hero.x,hero.y);hit(hero,expired,1);clock+=9;hit(ally,expired,10000);if(totalEarnedXP!==79)throw Error('Expired assist XP');
reset();chooseHero('ranger');begin();gainXP(1000);if(hero.range<=champions.ranger.range||!hero.attackBonus)throw Error('Ranger milestone');
reset();chooseHero('arcanist');begin();gainXP(1000);if(!hero.spellBonus)throw Error('Arcanist milestone');skillPoints=1;const oldSpell=spellMultiplier();spendPoint('power');if(spellMultiplier()<=oldSpell)throw Error('Spell scaling');
reset();chooseHero('shade');begin();gainXP(1000);if(!hero.lifesteal||hero.speed<=champions.shade.speed)throw Error('Shade milestone');hero.hp=50;hit(hero,unit(1,'soldier',hero.x,hero.y),20);if(hero.hp<=50)throw Error('Lifesteal');
reset();if(level!==1||skillPoints!==0||talents.power!==0||xp!==0)throw Error('New battle reset');draw();}
`,sandbox);
console.log('PASS: XP overflow, multi-level rewards, talent choices/caps, four class milestones, assist/chain XP, duplicate/idle XP prevention, lifesteal, level cap, progression through death, battle reset');
vm.runInContext(`{for(const [key,data]of Object.entries(SpriteRegistration)){if(data.frames.length!==32||data.bodyHeight<=0||data.frames.some(f=>!Number.isFinite(f.x)||!Number.isFinite(f.y)))throw Error('Invalid frame registration '+key);}reset();begin();keys.add('w');step(.1);const phase=hero.walkPhase;if(!(phase>0))throw Error('Walk phase must follow travel');keys.clear();step(.1);if(hero.walkPhase!==phase)throw Error('Idle advanced walk phase');keys.add('d');step(.1);keys.clear();if(hero.walkPhase<=phase||Math.abs(hero.moveFacing)>.01)throw Error('Turn lost gait/facing');hero.moving=true;strikeAnimation(hero);if(!hero.moving)throw Error('Attack interrupted walking');}`,sandbox);
for(const name of ['warden','ranger','arcanist','shade']){const png=fs.readFileSync('assets/art/'+name+'-walk-v2.png');assert.ok(Math.abs(png.readUInt32BE(16)/png.readUInt32BE(20)-2)<.02);}
vm.runInContext(`drawCalls.length=0;PixelArt.draw(testCtx,'warden',0,0,4,{action:'walk',walkPhase:.9,facing:0});PixelArt.draw(testCtx,'warden',0,0,4,{action:'idle',walkPhase:.9,facing:0});`,atlasContext);
assert.ok(atlasCalls[0].path.includes('warden-walk-v2'));assert.equal(atlasCalls[0].args[0],7*1254/8);assert.ok(atlasCalls[1].path.includes('warden-walk-v2'));assert.equal(atlasCalls[1].args[0],0);
console.log('PASS: polished 8-frame sheets, feet registration, distance-driven walk phase, idle phase hold, continuous turns, movement during attacks, shared idle/walk artwork');
const allIds=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(allIds.length,new Set(allIds).size,'HUD IDs must be unique');
const frameStart=markup.indexOf('id="gameFrame"'),frameEnd=markup.indexOf('</section></main>');
for(const id of ['pause','restart','fullscreen','skillQ','skillE','recall','upgrade-power','upgrade-vitality','upgrade-tempo','heroPortrait','gold']){const offset=markup.indexOf('id="'+id+'"');assert.ok(offset>frameStart&&offset<frameEnd,'Control must live inside game frame: '+id);}
assert.ok(!markup.includes('class="left-panel"')&&!markup.includes('class="right-panel"'),'External command panels removed');
vm.runInContext(`{reset();begin();gainXP(80);$('#upgrade-power').onclick();if(talents.power!==1)throw Error('Clickable talent upgrade');$('#skillQ').onclick();if(hero.q<=0)throw Error('Clickable ability');$('#pause').onclick();if(!paused)throw Error('In-frame pause');$('#pause').onclick();if(paused)throw Error('In-frame resume');$('#restart').onclick();if(started)throw Error('In-frame new battle');}`,sandbox);
console.log('PASS: unique in-frame HUD controls, clickable talent/skill buttons, pause/resume and new-battle bindings');
vm.runInContext(`{
function siegeTrial(id,rank,creepCount,talent='vitality'){
reset();chooseHero(id);begin();while(level<rank)gainXP(xpNeeded());while(spendPoint(talent)){}hero.hp=hero.max;
const tower=makeBuilding(1,'tower',1260,1500);buildings=[tower];units=units.filter(u=>u.type==='king');hero.x=1260;hero.y=1500+Math.min(hero.range-5,70);enemyTimer=9999;
for(let i=0;i<creepCount;i++)units.push(unit(0,'soldier',1220+(i%4)*24,1530+Math.floor(i/4)*24));
const initialHeroHP=hero.hp;let elapsed=0;
while(elapsed<40&&hero.hp>0&&tower.hp>0){if(hero.q<=0)ability('q');if(hero.e<=0&&id==='warden'&&hero.hp<hero.max-70)ability('e');step(.05);elapsed+=.05;}
return {id,rank,creepCount,seconds:Math.round(elapsed*10)/10,heroAlive:hero.hp>0,towerHP:Math.round(Math.max(0,tower.hp)),initialHeroHP};}
const results=[];for(const id of Object.keys(champions))for(const talent of ['power','vitality','tempo']){const result=siegeTrial(id,4,0,talent);if(result.heroAlive||result.towerHP<1000)throw Error('Early solo tower dive too strong '+JSON.stringify(result));if(talent==='vitality')results.push(result);}
const supported=siegeTrial('warden',4,8);if(supported.towerHP>0||!supported.heroAlive)throw Error('Wave-supported siege impossible '+JSON.stringify(supported));results.push(supported);
console.log('SIEGE BALANCE '+JSON.stringify(results));
reset();chooseHero('warden');begin();const defense=makeBuilding(1,'tower',1260,1500);buildings=[defense];units=units.filter(u=>u.type==='king');hero.x=1260;hero.y=1550;hero.hp=hero.max;
const hp=defense.hp;hit(hero,defense,100,'ability');if(hp-defense.hp>3.01)throw Error('Ability backdoor reduction');defense.hp-=200;clock=10;updateDefenses(1);if(defense.hp<=hp-203)throw Error('Backdoor regeneration');
const creep=unit(0,'soldier',1260,1520);units.push(creep);updateDefenses(.05);if(backdoorProtected(defense))throw Error('Troops must disable protection');
const baseHP=defense.hp;hit(hero,defense,100,'basic');if(Math.abs(baseHP-defense.hp-50)>.01)throw Error('Supported basic structure damage');
defense.lockedTarget=hero;if(guardTarget(defense,[hero,creep])!==hero)throw Error('Tower must hold aggro');hero.x=1820;if(guardTarget(defense,[hero,creep])!==creep)throw Error('Tower aggro release');
hero.hp=hero.max;hit(defense,hero,20);const combatHP=hero.hp;gainXP(xpNeeded());if(hero.hp!==combatHP)throw Error('Level-up healed during tower damage');
hero.q=6;hero.e=12;gainXP(xpNeeded());if(hero.q!==6||hero.e!==12)throw Error('Level-up refreshed cooldowns');
hit(defense,hero,10000);if(hero.respawn<8)throw Error('Lethal projectile needs respawn timer');step(.05);if(hero.hp>0)throw Error('Instant respawn after projectile death');
reset();begin();const royal=units.find(u=>u.team===1&&u.type==='king');const protectedDamage=objectiveDamage(hero,royal,100,'basic');buildings=buildings.filter(b=>b.team!==1||b.type!=='tower');if(objectiveDamage(hero,royal,100,'basic')<=protectedDamage)throw Error('King protection while towers stand');
}`,sandbox);
console.log('PASS: all 12 level-4 hero/talent solo dives fail, wave siege succeeds, backdoor/armor/regen, stable aggro, safe level rewards, no instant respawn, king defenses');
vm.runInContext(`{
reset();chooseHero('warden');begin();hero.hp=100;clock=5;applyBaseRegen(1);if(hero.hp!==126||!hero.regenActive)throw Error('Base regen rate');
const invader=unit(1,'soldier',hero.x+100,hero.y);units.push(invader);const hp=hero.hp;applyBaseRegen(1);if(hero.hp!==hp||hero.regenActive)throw Error('Regen during invasion');units=units.filter(u=>u!==invader);
hero.lastDamagedAt=clock;clock+=3;applyBaseRegen(1);if(hero.hp!==hp)throw Error('Regen safety delay');clock++;applyBaseRegen(1);if(hero.hp<=hp)throw Error('Regen after delay');
hero.x=1260;hero.y=1500;const fieldHP=hero.hp;applyBaseRegen(1);if(hero.hp!==fieldHP)throw Error('Field regen');
hero.x=1260;hero.y=4540;hero.hp=hero.max;const killer=makeBuilding(1,'tower',hero.x+20,hero.y);hit(killer,hero,10000);ui();const deathTime=hero.respawn;if($('#deathPanel').hidden||+$('#deathSeconds').textContent!==deathTime)throw Error('Visible death timer');
step(.5);if(hero.hp>0||hero.respawn>=deathTime)throw Error('Death countdown');togglePause();const remaining=hero.respawn;step(1);if(hero.respawn!==remaining)throw Error('Death timer during pause');togglePause();for(let i=0;i<100&&hero.hp<=0;i++)step(.1);if(hero.hp!==hero.max||!$('#deathPanel').hidden)throw Error('Full-health respawn / dismiss timer');
const wallWalker={x:1020,y:4280};Battlefield.move(wallWalker,1020,4080);if(wallWalker.y<4220)throw Error('Walk through castle wall');
const gateWalker={x:1260,y:4280};Battlefield.move(gateWalker,1260,4080);if(gateWalker.y!==4080)throw Error('Gate passage blocked');
const riverWalker={x:900,y:2420};Battlefield.move(riverWalker,900,2620);if(riverWalker.y>2480)throw Error('Walk through deep river');
const bridgeWalker={x:1260,y:2420};Battlefield.move(bridgeWalker,1260,2620);if(bridgeWalker.y!==2620)throw Error('Bridge passage blocked');
const marcher={x:960,y:4650};for(let i=0;i<4000&&dist(marcher,ENEMY)>25;i++){const goal=Battlefield.route(marcher,ENEMY),d=dist(marcher,goal)||1;Battlefield.move(marcher,marcher.x+(goal.x-marcher.x)/d*5.2,marcher.y+(goal.y-marcher.y)/d*5.2);}if(dist(marcher,ENEMY)>25)throw Error('Army cannot navigate keeps and river');
if(canPlace(180,3000))throw Error('Building outside wall');draw();
}`,sandbox);
for(const name of ['foliage','fortifications']){const png=fs.readFileSync('assets/art/'+name+'-v1.png');assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');}
console.log('PASS: safe base regeneration, visible death timer / paused countdown / respawn, wall and river collision, open gates/bridges, end-to-end army routing, environment assets');
vm.runInContext(`{const samples=[],originalTile=PixelArt.tile;PixelArt.tile=(ctx,index,x,y,size)=>{samples.push(index);return true;};hero.x=1260;hero.y=4540;draw();if(!samples.includes(0)||!samples.includes(4)||!samples.includes(8))throw Error('Missing grass, road or castle floor pass');samples.length=0;hero.y=2512;draw();if(!samples.includes(10)||!samples.includes(12))throw Error('Missing river or bridge tiles');PixelArt.tile=originalTile;}`,sandbox);
console.log('PASS: actual game draw samples grass, road, courtyard, river and bridge tile textures');
vm.runInContext(`{
reset();chooseHero('warden');selectDifficulty(0);const easyHP=enemyHero.max,easyReaction=difficulty().reaction,easyBuild=difficulty().build;selectDifficulty(7);if(enemyHero.max<=easyHP||difficulty().reaction>=easyReaction||difficulty().build>=easyBuild)throw Error('Difficulty scaling');
begin();const lockedDifficulty=selectedDifficulty;if(selectDifficulty(0)!==false||selectedDifficulty!==lockedDifficulty)throw Error('Mid-match difficulty change');
reset();chooseHero('warden');selectDifficulty(3);begin();enemyHero.x=1260;enemyHero.y=1400;hero.x=1260;hero.y=1450;enemyDecision([hero]);if(enemyHero.mode!=='KITING'||enemyHero.goal.y>=enemyHero.y)throw Error('Ranged kiting');
enemyHero.hp=enemyHero.max*.15;enemyDecision([hero]);if(enemyHero.mode!=='RETREATING'||enemyHero.goal.y!==500)throw Error('Low-health retreat');
reset();selectDifficulty(5);begin();enemyHero.x=1260;enemyHero.y=1400;hero.x=1260;hero.y=1450;projectiles=[{source:hero,target:enemyHero,melee:false,x:1260,y:1370,angle:Math.PI/2}];enemyDecision([hero]);if(enemyHero.mode!=='EVADING')throw Error('Hard-mode projectile evasion');projectiles=[];
reset();selectDifficulty(2);begin();const count=buildings.length;enemyGold=0;enemyTimer=0;updateEnemyEconomy(0);if(buildings.length!==count)throw Error('AI ignored budget');enemyGold=220;enemyTimer=0;updateEnemyEconomy(0);if(buildings.length!==count+1||enemyGold>=220)throw Error('AI construction economy');
const c=enemyHero,maxBefore=c.max;enemyGainXP(500);if(c.level<=1||c.max<=maxBefore)throw Error('Enemy leveling');hit(hero,c,100000);if(c.hp>0||c.respawn<=0)throw Error('Enemy death timer');updateEnemyHero(.1);if(c.hp>0||!units.includes(c))throw Error('Enemy must stay dead and tracked');for(let i=0;i<200&&c.hp<=0;i++)updateEnemyHero(.1);if(c.hp!==c.max||c.y!==500)throw Error('Enemy respawn');
for(let mode=0;mode<8;mode++){reset();selectDifficulty(mode);begin();const enemyStart={x:enemyHero.x,y:enemyHero.y};for(let i=0;i<1200&&!ended;i++)step(.05);if(!Number.isFinite(enemyHero.hp)||!Number.isFinite(enemyHero.x)||enemyHero.hp>0&&dist(enemyHero,enemyStart)<10)throw Error('Enemy AI stuck / invalid mode '+mode);draw();}
reset();selectDifficulty(2);
}`,sandbox);
assert.equal((markup.match(/<option value="[0-7]"/g)||[]).length,8);
console.log('PASS: eight difficulty tiers, pre-match lock, enemy champion kiting/retreat/evasion, budgeted economy, leveling/death/respawn, 60-second simulations at every tier');
vm.runInContext(`{reset();begin();const startGold=gold;step(1);if(startGold!==200||gold-startGold!==1)throw Error('Slower passive gold');const creep=unit(1,'soldier',hero.x,hero.y);const before=gold;hit(hero,creep,10000);if(gold-before!==10)throw Error('Hero gold coin bounty');const ally=unit(0,'soldier',hero.x,hero.y),other=unit(1,'soldier',hero.x,hero.y),beforeArmy=gold;hit(ally,other,10000);if(gold-beforeArmy!==3)throw Error('Army gold coin bounty');const beforeLevel=gold;gainXP(xpNeeded()-xp);if(gold-beforeLevel!==14)throw Error('Reduced level gold');if(difficulty().income!==1)throw Error('Standard AI coin economy');}`,sandbox);
assert.ok(markup.includes('Gold coins')&&markup.includes('+1/s'));
console.log('PASS: starting coins, 1 coin/s income, reduced kill and level bounties, matching Standard AI income and coin HUD');

