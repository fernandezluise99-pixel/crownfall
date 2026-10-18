/* Strategic systems layered over the original battle simulation. */
'use strict';
const Strategy = (() => {
  const shop = {
    blade: {name:'Tempered blade', description:'+6 hero attack', cost:100, apply(){hero.damage+=6;}},
    armor: {name:'Runic mail', description:'+25 hero HP, +2% armor', cost:110, apply(){hero.max+=25;hero.armor=(hero.armor||0)+.02;}},
    recovery: {name:'Field medicine', description:'+1.5 HP/s after 8s without damage', cost:90, apply(){}},
    arms: {name:'Army weapons', description:'+10% troop attack', cost:140, apply(){}},
    drill: {name:'Army endurance', description:'+15% troop HP, including recruits', cost:140, apply(){for(const u of units.filter(u=>u.team===0&&!isChampion(u)&&u.type!=='king')){u.max+=u.baseMax*.15;u.hp+=u.baseMax*.15;}}},
    logistics: {name:'Recruitment drill', description:'10% faster recruitment (30% cap)', cost:160, apply(){}}
  };
  const specializations = {
    warden:[['Bastion','+5% armor; allies within 220 take 10% less damage'],['Earthshaker','+25% Q damage; Q slows enemies for 2s']],
    ranger:[['Deadeye','+45 range; +12% attack speed'],['Trailblazer','+25 speed; E grants 30% movement speed']],
    arcanist:[['Pyromancer','+25% spell power'],['Spellweaver','Q/E cooldowns 15% shorter; blink heals 20 HP']],
    shade:[['Executioner','+25% damage against targets below 35% HP'],['Reaper','+8% lifesteal; +20 speed']]
  };
  let ranks={}, selected=null, focus=null, command='move', spec=null, stats={}, reported=false, audio=null, muted=false, map='verdant', march=null, lastSound=-100;
  const panel=document.createElement('section');panel.id='strategyPanel';panel.className='strategy-panel';panel.hidden=true;$('#gameFrame').appendChild(panel);
  const toolbar=document.createElement('div');toolbar.className='strategy-toolbar';toolbar.innerHTML='<button id="shopOpen">Merchant [6]</button><button id="specialize">Hero path</button><button id="attackMove">Attack-move [T]</button><button id="holdPosition">Hold [H]</button><button id="soundToggle">Sound: on</button>';$('#gameFrame').appendChild(toolbar);
  const mapLabel=document.createElement('label');mapLabel.className='map-choice';mapLabel.innerHTML='BATTLEFIELD <select id="mapSelect"><option value="verdant">Verdant Front · three crossings</option><option value="narrows">Stone Narrows · two narrow crossings</option></select>';$('.difficulty-panel').appendChild(mapLabel);
  const siegeButton=document.createElement('button');siegeButton.dataset.build='siege';siegeButton.innerHTML='<span class="equipment-icon">♜</span><span><b>Siege workshop</b><small>Siege engine / 22 seconds</small></span><span class="cost">260 coins</span>';$('.builds').appendChild(siegeButton);siegeButton.onclick=()=>build('siege');costs.siege=260;
  const price=id=>Math.round(shop[id].cost*(1+(ranks[id]||0)*.65));
  const active=()=>started&&!paused&&!ended;
  const merchant=()=>buildings.some(b=>b.team===0&&b.type==='merchant'&&b.hp>0&&!b.buildLeft);
  function sound(kind){if(muted)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audio)audio=new Audio();if(audio.state==='suspended')audio.resume();const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type=kind==='death'?'sawtooth':'triangle';osc.frequency.setValueAtTime(({hit:180,attack:340,ability:580,level:760,death:90,build:460})[kind]||240,now);osc.frequency.exponentialRampToValueAtTime(kind==='level'?1100:70,now+.13);gain.gain.setValueAtTime(.025,now);gain.gain.exponentialRampToValueAtTime(.001,now+.15);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(now+.16);}catch{/* Sound is optional when the browser has no audio output. */}}
  function close(){panel.hidden=true;}
  function show(title,body){panel.dataset.mode='';panel.innerHTML='<header><b>'+title+'</b><button id="panelClose" aria-label="Close panel">×</button></header>'+body;panel.hidden=false;$('#panelClose').onclick=close;}
  function openShop(){if(!started||ended)return;show('MERCHANT · HERO & ARMY',!merchant()?'<p>Construct a merchant and wait for construction to finish.</p>':Object.entries(shop).map(([id,s])=>'<button data-purchase="'+id+'"><b>'+s.name+' · '+(ranks[id]||0)+'/3</b><span>'+s.description+'</span><small>'+price(id)+' gold coins</small></button>').join(''));for(const button of panel.querySelectorAll('[data-purchase]')){const id=button.dataset.purchase;button.disabled=!active()||(ranks[id]||0)>=3||gold<price(id);button.onclick=()=>{purchase(id);openShop();};}}
  function purchase(id){if(!active()||!merchant()||!shop[id]||(ranks[id]||0)>=3||gold<price(id))return false;gold-=price(id);ranks[id]=(ranks[id]||0)+1;shop[id].apply();stats.upgrades++;sound('build');ui();return true;}
  function openPath(){if(!started||ended)return;const choices=specializations[selectedHero];show('HERO PATH · UNLOCKS AT LEVEL 5','<p>'+passiveText()+'</p>'+choices.map(([name,description],i)=>'<button data-path="'+i+'"><b>'+name+(spec===i?' · CHOSEN':'')+'</b><span>'+description+'</span></button>').join(''));for(const button of panel.querySelectorAll('[data-path]')){button.disabled=!active()||level<5||spec!==null;button.onclick=()=>{choosePath(Number(button.dataset.path));openPath();};}}
  function choosePath(index){if(!active()||level<5||spec!==null||![0,1].includes(index))return false;spec=index;applyPath(hero,selectedHero,index);stats.upgrades++;notify(specializations[selectedHero][index][0]+' path chosen for this battle.');return true;}
  function applyPath(a,id,index){a.path=index;if(id==='warden'&&index===0)a.armor=(a.armor||0)+.05;if(id==='ranger'){if(index===0){a.range+=45;a.attackBonus=(a.attackBonus||0)+.12;}else a.speed+=25;}if(id==='arcanist'&&index===0)a.spellBonus=(a.spellBonus||0)+.25;if(id==='shade'){if(index===1){a.lifesteal=(a.lifesteal||0)+.08;a.speed+=20;}}}
  function passiveText(){return {warden:'Stand firm: 8% less non-guard damage while stationary.',ranger:'Patient aim: +15% basic damage beyond 180 range.',arcanist:'Arcane rhythm: every fourth basic attack deals +35% damage.',shade:'Back to shadows: +20% basic damage after 4s without attacking.'}[selectedHero];}
  function inspect(b){selected=b;show(b.type.toUpperCase()+' · TIER '+(b.tier||1),'<p id="buildingStatus">'+Math.ceil(b.hp)+' / '+Math.ceil(b.max)+' HP'+(b.buildLeft?' · Building: '+Math.ceil(b.buildLeft)+'s':b.upgradeLeft?' · Upgrading: '+Math.ceil(b.upgradeLeft)+'s':b.type==='siege'?' · Engine in '+Math.ceil(b.timer)+'s':['barracks','archery','wizard'].includes(b.type)?' · Recruit in '+Math.ceil(b.timer)+'s':'')+'</p><p>Tier upgrades: +25% original HP, +15% attack, 15% faster production per tier. Tier 2 requires a merchant; tier 3 also requires level 8.</p><button id="buildingUpgrade">Upgrade · '+upgradeCost(b)+' coins</button><button id="buildingRepair">Repair +30% HP · '+repairCost(b)+' coins</button><button id="buildingSell">Demolish · recover '+Math.floor(costs[b.type]*.4)+' coins</button>');panel.dataset.mode='building';$('#buildingUpgrade').disabled=!active()||!!b.buildLeft||!!b.upgradeLeft||(b.tier||1)>=3||gold<upgradeCost(b)||!merchant()||((b.tier||1)===2&&level<8);$('#buildingRepair').disabled=!active()||!!b.buildLeft||gold<repairCost(b)||b.hp>=b.max;$('#buildingSell').disabled=!active();$('#buildingUpgrade').onclick=()=>{upgrade(b);inspect(b);};$('#buildingRepair').onclick=()=>{repair(b);inspect(b);};$('#buildingSell').onclick=()=>{if(active()&&buildings.includes(b)){gold+=Math.floor(costs[b.type]*.4);b.hp=0;b.demolished=true;selected=null;close();}};}
  const upgradeCost=b=>Math.round(costs[b.type]*.8*(b.tier||1));
  const repairCost=b=>Math.max(20,Math.ceil(costs[b.type]*.2));
  function upgrade(b){if(!active()||b.team!==0||!buildings.includes(b)||b.buildLeft||b.upgradeLeft||(b.tier||1)>=3||gold<upgradeCost(b)||!merchant()||((b.tier||1)===2&&level<8))return false;gold-=upgradeCost(b);b.upgradeLeft=8;b.cd=8;stats.upgrades++;return true;}
  function repair(b){if(!active()||b.team!==0||!buildings.includes(b)||b.buildLeft||gold<repairCost(b)||b.hp>=b.max)return false;gold-=repairCost(b);b.hp=Math.min(b.max,b.hp+b.max*.3);return true;}
  function selectMap(id){if(started&&!ended)return false;map=id==='narrows'?'narrows':'verdant';Battlefield.crossings.splice(0,Battlefield.crossings.length,...(map==='narrows'?[{x:840,half:76},{x:1680,half:76}]:[{x:600,half:64},{x:1260,half:140},{x:1920,half:64}]));$('#mapSelect').value=map;return true;}
  const originalReset=reset;
  reset=function(){ranks={};originalReset();selected=null;focus=null;march=null;command='move';spec=null;reported=false;stats={kills:0,deaths:0,gold:200,structureDamage:0,heroDamage:0,losses:0,enemyLosses:0,upgrades:0,buildings:0};close();$('#mapSelect').disabled=false;};
  const originalBegin=begin;begin=function(){originalBegin();$('#mapSelect').disabled=true;sound('build');};
  const originalUnit=unit;
  unit=function(team,type,x,y){let u;if(type==='siege'){const factor=team===1?difficulty().stats:1;u={id:uid++,team,type,x,y,hp:240*factor,max:240*factor,damage:55*factor,range:300,speed:32,cd:0};}else u=originalUnit(team,type,x,y);u.baseMax=u.max;if(type!=='hero'&&type!=='king'){const producer=buildings?.find(b=>b.team===team&&Math.abs(b.x-x)<5&&Math.abs(b.y-y)<=65);const tier=(producer?.tier||1)-1;u.damage*=1+tier*.15;u.max*=1+tier*.15+(team===0?(ranks.drill||0)*.15:0);u.hp=u.max;}return u;};
  const originalMake=makeBuilding;
  makeBuilding=function(...args){const b=originalMake(...args);b.tier=1;b.baseMax=b.max;return b;};
  const originalPlace=placeBuilding;
  placeBuilding=function(x,y){const before=buildings.length,result=originalPlace(x,y);if(result&&buildings.length>before){const b=buildings[buildings.length-1];b.buildLeft=b.type==='tower'?12:8;b.timer=b.type==='siege'?22:b.buildLeft+1;b.cd=b.buildLeft;stats.buildings++;notify('Construction started · '+b.buildLeft+' seconds.');}return result;};
  const originalBuild=build;build=function(type){if(type==='forge'){openShop();return;}originalBuild(type);};
  const originalHit=hit;
  hit=function(a,b,damage,kind='basic'){
    if(b.hp<=0)return;const before=b.hp;
    if(!isChampion(a)&&!a.structure&&a.type!=='king'){
      if(a.type==='soldier'&&b.type==='archer')damage*=1.3;
      if(a.type==='archer'&&b.type==='wizard')damage*=1.4;
      if(a.type==='wizard'&&b.type==='soldier')damage*=1.35;
      if(a.type==='siege')damage*=b.structure||b.type==='king'?2.5:.4;
      if(a.team===0)damage*=1+(ranks.arms||0)*.1;
    }
    if(b.type==='soldier'&&a.type==='archer')damage*=.8;
    if(isChampion(a)){
      const id=a===hero?selectedHero:a.archetype;
      if(kind==='basic'){
        if(id==='ranger'&&dist(a,b)>180)damage*=1.15;
        if(id==='arcanist'){a.rhythm=(a.rhythm||0)+1;if(a.rhythm%4===0)damage*=1.35;}
        if(id==='shade'&&clock-(a.lastBasicAt??-100)>4)damage*=1.2;
        a.lastBasicAt=clock;
      }
      if(a.path===0&&id==='shade'&&b.hp/b.max<.35)damage*=1.25;
      if(a.path===1&&id==='warden'&&kind==='ability'){damage*=1.25;b.slowUntil=clock+2;}
    }
    const defender=b===hero?selectedHero:b===enemyHero?b.archetype:null;
    if(defender==='warden'&&!b.moving&&!isGuard(a))damage*=.92;
    const guardian=b.team===0?hero:enemyHero;
    if(guardian&&guardian.hp>0&&(guardian===hero?selectedHero:guardian.archetype)==='warden'&&guardian.path===0&&dist(guardian,b)<220)damage*=.9;
    if(b===enemyHero)damage*=1-Math.min(.4,b.armor||0)*(isGuard(a)?.2:1);
    originalHit(a,b,damage,kind);
    const actual=Math.max(0,before-b.hp);
    if(a===enemyHero&&a.hp>0&&a.lifesteal&&!b.structure&&b.type!=='king')a.hp=Math.min(a.max,a.hp+actual*a.lifesteal);
    if(actual>0&&(a===hero||b===hero)&&clock-lastSound>.08){sound('hit');lastSound=clock;}
    if(a.team===0&&actual){if(b.structure||b.type==='king')stats.structureDamage+=actual;else stats.heroDamage+=a===hero?actual:0;}
    if(actual>5&&a===hero)effects.push({type:'text',text:Math.round(actual).toString(),x:b.x,y:b.y-30,t:.65,max:.65,color:'#f5ddb0'});
    if(before>0&&b.hp<=0){sound('death');effects.push({type:'ring',x:b.x,y:b.y,radius:48,t:.4,max:.4,color:b.team?'#df8e78':'#8bc8be'});if(b===hero){stats.deaths++;march=null;focus=null;command='move';}if(b.team===1&&a===hero)stats.kills++;if(b.team===0&&b.type!=='king')enemyGold+=a===enemyHero?b===hero?25:b.structure?35:10:b.structure?15:3;if(!isChampion(b)&&!b.structure&&b.type!=='king'){if(b.team===0)stats.losses++;else stats.enemyLosses++;}}
  };
  const originalAttack=attack;
  attack=function(a,b){originalAttack(a,b);if(a.type==='siege')a.cd=3;if(a===hero||a===enemyHero){a.cd*=Math.max(.55,1-(a===enemyHero?(a.attackBonus||0)+(a.talents?.tempo||0)*.03:0));if(a===hero)sound('attack');}};
  chooseTroopTarget=function(u,enemies){const score=v=>{let value=dist(u,v);if(value<420){if(u.type==='siege'&&(v.structure||v.type==='king'))value*=.35;if(u.type==='archer'&&v.type==='wizard')value*=.65;if(u.type==='wizard'&&v.type==='soldier')value*=.65;if(u.type==='soldier'&&isChampion(v))value*=.8;}return value;};return enemies.reduce((best,v)=>!best||score(v)<score(best)?v:best,null);};
  const originalEconomy=updateEnemyEconomy;
  updateEnemyEconomy=function(dt){const before=new Set(buildings);originalEconomy(dt);for(const b of buildings)if(!before.has(b)&&b.team===1){b.buildLeft=b.type==='tower'?12:8;b.timer=b.buildLeft+1;b.cd=b.buildLeft;}
    if(selectedDifficulty>=3&&clock>180&&enemyGold>=costs.siege&&!buildings.some(b=>b.team===1&&b.type==='siege')){const p={x:1500,y:720};if(!buildings.some(b=>dist(b,p)<110)){enemyGold-=costs.siege;const b=makeBuilding(1,'siege',p.x,p.y);b.buildLeft=8;b.timer=9;buildings.push(b);}}
  };
  const originalAbility=ability;
  ability=function(type){const before=hero[type];if(type==='b'){march=null;focus=null;command='move';}originalAbility(type);if(['q','e'].includes(type)&&before<=0&&hero[type]>0){sound('ability');if(selectedHero==='arcanist'&&spec===1){hero[type]*=.85;if(type==='e')hero.hp=Math.min(hero.max,hero.hp+20);}}};
  const originalEnemyXP=enemyGainXP;
  enemyGainXP=function(amount){const before=enemyHero?.level||1;originalEnemyXP(amount);const a=enemyHero;if(!a)return;for(let n=before+1;n<=a.level;n++){
    a.talents=a.talents||{power:0,vitality:0,tempo:0};const type=['power','vitality','tempo'][(n-2)%3];a.talents[type]++;
    if(type==='vitality'){a.max+=20;a.armor=(a.armor||0)+.015;}if(type==='tempo')a.speed+=champions[a.archetype].speed*.01;
    if(n%5===0){if(a.archetype==='warden'){a.max+=40;a.armor=(a.armor||0)+.02;}if(a.archetype==='ranger'){a.range+=20;a.attackBonus=(a.attackBonus||0)+.06;}if(a.archetype==='arcanist')a.spellBonus=(a.spellBonus||0)+.15;if(a.archetype==='shade'){a.speed+=12;a.lifesteal=(a.lifesteal||0)+.06;}}
    enemyGold+=10+n*2;if(n===5)applyPath(a,a.archetype,selectedDifficulty%2);
  }};
  const originalEnemySkill=enemySkill;
  enemySkill=function(type,enemies){const a=enemyHero,before=a[type],oldLevel=a.level;originalEnemySkill(type,enemies);if(before<=0&&a[type]>0){a[type]*=Math.max(.7,1-(oldLevel-1)*.005-(a.talents?.tempo||0)*.02)*(a.archetype==='arcanist'&&a.path===1?.85:1);if(a.archetype==='arcanist'&&a.path===1&&type==='e')a.hp=Math.min(a.max,a.hp+20);}};
  function report(){show('BATTLE REPORT · '+(units.find(u=>u.team===1&&u.type==='king').hp<=0?'VICTORY':'DEFEAT'),'<p>'+format(clock)+' · '+champions[selectedHero].name+' level '+level+' · '+difficulty().name+' · '+(map==='verdant'?'Verdant Front':'Stone Narrows')+'</p><dl>'+Object.entries({'Hero last hits':stats.kills,'Deaths':stats.deaths,'Gold earned':Math.floor(stats.gold),'Structure damage':Math.round(stats.structureDamage),'Hero combat damage':Math.round(stats.heroDamage),'Allied troops lost':stats.losses,'Enemy troops defeated':stats.enemyLosses,'Upgrades purchased':stats.upgrades,'Buildings constructed':stats.buildings}).map(([name,value])=>'<div><dt>'+name+'</dt><dd>'+value+'</dd></div>').join('')+'</dl>');}
  const originalStep=step;
  step=function(dt){if(!active()){originalStep(dt);return;}const previousGold=gold,previousLevel=level;
    for(const b of buildings){if(b.buildLeft>0){b.buildLeft=Math.max(0,b.buildLeft-dt);b.cd=Math.max(b.cd,b.buildLeft+dt);if(!b.buildLeft)notify(b.type+' ready.');}if(b.upgradeLeft>0){b.timer+=dt;b.upgradeLeft=Math.max(0,b.upgradeLeft-dt);b.cd=Math.max(b.cd,b.upgradeLeft+dt);if(!b.upgradeLeft){b.tier++;const hp=b.baseMax*.25;b.max+=hp;b.hp+=hp;b.damage*=1.15;}}}
    if(focus?.hp<=0)focus=null;
    if(focus&&hero.hp>0&&command!=='hold'){target=dist(hero,focus)>hero.range*.9?focus:null;}
    if(command==='hold')target=null;
    const keyboardMove=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>keys.has(k));if(keyboardMove){focus=null;command='move';march=null;}
    if(march&&!focus&&command!=='hold'){target=Battlefield.route(hero,march);if(dist(hero,march)<8){march=null;target=null;}}
    if(focus&&target)target=Battlefield.route(hero,focus);
    const speeds=[];for(const a of [...units,hero]){let factor=clock<(a.slowUntil||0)?.6:1;if(isChampion(a)&&(a===hero?selectedHero:a.archetype)==='ranger'&&a.path===1&&a.boost>0)factor*=1.3;if(factor!==1){speeds.push([a,a.speed]);a.speed*=factor;}}
    // Reserve the attack until the core movement pass finishes, then honor explicit targeting.
    const savedCD=hero.cd,manual=focus&&focus.hp>0;if(manual)hero.cd=Math.max(hero.cd,dt+.001);
    originalStep(dt);
    if(manual){hero.cd=Math.max(0,savedCD-dt);if(hero.hp>0&&focus.hp>0&&dist(hero,focus)<=hero.range+10&&hero.cd<=0)attack(hero,focus);}
    for(const [a,speed] of speeds)a.speed=speed;
    if(command==='attack'&&!focus){focus=[...units,...buildings].filter(u=>u.team===1&&u.hp>0&&dist(hero,u)<hero.range+110).sort((a,b)=>dist(hero,a)-dist(hero,b))[0]||null;}
    for(const b of buildings){if(b.buildLeft||b.upgradeLeft)continue;const tierFactor=1+((b.tier||1)-1)*.15,logistics=b.team===0?(ranks.logistics||0)*.1:0;if(['barracks','archery','wizard'].includes(b.type))b.timer-=dt*(tierFactor-1+logistics);if(b.type==='siege'){b.timer-=dt*tierFactor;if(b.timer<=0&&units.filter(u=>u.team===b.team&&u.type!=='king'&&!isChampion(u)).length<60){units.push(unit(b.team,'siege',b.x,b.y+(b.team?60:-60)));b.timer=22;}}}
    if(hero.hp>0&&clock-(hero.lastDamagedAt??-100)>8)hero.hp=Math.min(hero.max,hero.hp+(ranks.recovery||0)*1.5*dt);
    stats.gold+=Math.max(0,gold-previousGold);if(level>previousLevel)sound('level');
    if(selected&&!buildings.includes(selected)){selected=null;close();}
    if(ended&&!reported){reported=true;report();}
  };
  const originalUI=ui;
  ui=function(){originalUI();const button=document.querySelector('[data-build="forge"]');if(button)button.disabled=!started||paused||ended;$('#forgecost').textContent='Shop';$('#equipmentHint').textContent=merchant()?'Choose hero or army upgrades':'Construct a merchant';$('#army').textContent=units.filter(u=>u.team===0&&u.type!=='king').length+' / 60 troops';$('#specialize').textContent=spec===null?'Hero path · LV 5':specializations[selectedHero][spec][0];
    for(const button of panel.querySelectorAll('[data-purchase]')){const id=button.dataset.purchase;button.disabled=!active()||!merchant()||(ranks[id]||0)>=3||gold<price(id);}
    if(!panel.hidden&&panel.dataset.mode==='building'&&selected){const b=selected;$('#buildingStatus').textContent=Math.ceil(b.hp)+' / '+Math.ceil(b.max)+' HP · '+(b.buildLeft?'Building '+Math.ceil(b.buildLeft)+'s':b.upgradeLeft?'Upgrading '+Math.ceil(b.upgradeLeft)+'s':['barracks','archery','wizard','siege'].includes(b.type)?'Next recruit '+Math.ceil(b.timer)+'s':'Ready');$('#buildingUpgrade').disabled=!active()||!!b.buildLeft||!!b.upgradeLeft||(b.tier||1)>=3||gold<upgradeCost(b)||!merchant()||((b.tier||1)===2&&level<8);$('#buildingRepair').disabled=!active()||!!b.buildLeft||gold<repairCost(b)||b.hp>=b.max;$('#buildingSell').disabled=!active();}};
  const tierUI=ui;
  ui=function(){tierUI();if(selected&&!panel.hidden&&panel.dataset.mode==='building'){$('#buildingUpgrade').textContent='Upgrade · '+upgradeCost(selected)+' coins';$('#buildingStatus').textContent='Tier '+(selected.tier||1)+' · '+$('#buildingStatus').textContent;}};
  const originalDraw=draw;
  draw=function(){originalDraw();ctx.save();ctx.translate(-camera.x,-camera.y);if(focus?.hp>0){pixelRing(focus.x,focus.y,42,'#f1957b');label('TARGET',focus.x,focus.y-70,'#f1957b',14);}if(selected&&selected.hp>0)pixelRing(selected.x,selected.y,65,'#f0d078');for(const b of buildings){if(b.buildLeft)label('BUILD '+Math.ceil(b.buildLeft)+'s',b.x,b.y-80,'#ecd79d',14);else if(b.upgradeLeft)label('UPGRADE '+Math.ceil(b.upgradeLeft)+'s',b.x,b.y-80,'#ecd79d',14);else if((b.tier||1)>1)label('TIER '+b.tier,b.x,b.y-80,'#ecd79d',14);}ctx.restore();};
  // Capture click intent before the original movement handler.
  canvas.addEventListener('pointerdown',e=>{if(!active()||placing)return;const r=canvas.getBoundingClientRect(),lx=(e.clientX-r.left)/r.width*VW,ly=(e.clientY-r.top)/r.height*VH;if(lx<124&&ly>VH-200)return;const p={x:camera.x+lx,y:camera.y+ly};const b=buildings.find(b=>b.team===0&&b.hp>0&&dist(b,p)<65);if(b){e.stopImmediatePropagation();march=null;target=null;focus=null;inspect(b);return;}focus=[...units,...buildings].filter(u=>u.team===1&&u.hp>0&&dist(u,p)<(u.structure||u.type==='king'?65:35)).sort((a,b)=>dist(a,p)-dist(b,p))[0]||null;if(command==='hold')command='move';march=focus?null:p;if(focus){e.stopImmediatePropagation();target=focus;notify('Target selected.');}},true);
  document.addEventListener('keydown',e=>{if(e.repeat)return;if(e.key.toLowerCase()==='t'&&active()){command='attack';focus=null;notify('Attack-move: click a destination.');}if(e.key.toLowerCase()==='h'&&active()){command='hold';focus=null;target=null;notify('Holding position. Auto-attacks remain active.');}if(e.key==='Escape')close();});
  $('#shopOpen').onclick=openShop;$('#specialize').onclick=openPath;$('#attackMove').onclick=()=>{if(active()){command='attack';focus=null;notify('Click an attack-move destination.');}};$('#holdPosition').onclick=()=>{if(active()){command='hold';focus=null;target=null;}};$('#soundToggle').onclick=()=>{muted=!muted;$('#soundToggle').textContent='Sound: '+(muted?'off':'on');if(!muted)sound('build');};$('#mapSelect').onchange=e=>selectMap(e.target.value);
  reset();
  return {purchase,choosePath,selectMap,upgrade,repair,openShop,openPath,inspect,report,get ranks(){return ranks;},get stats(){return stats;},get focus(){return focus;},get command(){return command;}};
})();
