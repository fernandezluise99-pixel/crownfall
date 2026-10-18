const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),events=new Map(),simulationTicks=process.env.CROWNFALL_QUICK?1200:12000;
function node(id){if(!nodes.has(id))nodes.set(id,{id,style:{},dataset:{},children:[],classList:{toggle(){}},setAttribute(){},appendChild(child){this.children.push(child);},querySelectorAll(){return [];},addEventListener(type,callback,capture){const key=id+':'+type;if(!events.has(key))events.set(key,[]);events.get(key).push({callback,capture});},focus(){},getBoundingClientRect(){return {left:0,top:0,width:1260,height:800};},getContext(){return new Proxy({},{get:(o,k)=>o[k]??(()=>{})});}});return nodes.get(id);}
const sandbox={document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>node('generated'+nodes.size),addEventListener(type,callback){node('document').addEventListener(type,callback);}},window:{addEventListener(){}},requestAnimationFrame(){},console};vm.createContext(sandbox);
for(const file of ['art.js','generated-art.js','sprite-registration.js','animation-art.js','environment.js','enemy-ai.js','game.js','strategy-art.js','strategy.js','combat-hud.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
function run(code){return vm.runInContext(code,sandbox);}
function click(x,y){let stopped=false;const event={clientX:x,clientY:y,stopImmediatePropagation(){stopped=true;}};for(const {callback} of [...events.get('#game:pointerdown')].sort((a,b)=>Number(!!b.capture)-Number(!!a.capture))){if(!stopped)callback(event);}}
run(`begin();gold=5000;build('merchant');if(!placeBuilding(1560,4680))throw Error('Merchant placement');`);
assert.equal(run(`Strategy.purchase('blade')`),false,'unfinished merchant cannot sell');
run(`for(let i=0;i<180;i++)step(.05);`);
assert.equal(run(`Strategy.purchase('blade')`),true);assert.equal(run('hero.damage'),34);
assert.equal(run(`Strategy.purchase('armor')`),true);assert.equal(run('hero.max'),325);
run(`Strategy.purchase('drill');`);assert.equal(run(`unit(0,'soldier',1000,2800).max`),126.49999999999999);
run(`Strategy.purchase('arms');Strategy.purchase('logistics');Strategy.purchase('recovery');`);
assert.equal(run(`Strategy.purchase('missing')`),false);
run(`Strategy.purchase('blade');Strategy.purchase('blade');`);assert.equal(run(`Strategy.purchase('blade')`),false,'rank cap');
assert.equal(run('Strategy.choosePath(0)'),false,'level gate');run(`level=5`);assert.equal(run('Strategy.choosePath(0)'),true);assert.equal(run('Strategy.choosePath(1)'),false,'one path per match');
run(`for(const b of buildings)b.timer=100;build('barracks');placeBuilding(960,4480);`);
assert.equal(run(`buildings[buildings.length-1].buildLeft`),8);
const count=run(`units.filter(u=>u.team===0&&u.type==='soldier').length`);run(`step(.05)`);assert.equal(run(`units.filter(u=>u.team===0&&u.type==='soldier').length`),count);
run(`for(let i=0;i<180;i++)step(.05);var chosen=buildings[buildings.length-1];`);
assert.equal(run(`Strategy.upgrade(chosen)`),true);run(`for(let i=0;i<170;i++)step(.05);`);assert.equal(run('chosen.tier'),2);assert.equal(run('chosen.max'),625);
run(`chosen.hp-=200`);assert.equal(run('Strategy.repair(chosen)'),true);assert.equal(run('chosen.hp'),612.5);
run(`level=7`);assert.equal(run('Strategy.upgrade(chosen)'),false);run(`level=8`);assert.equal(run('Strategy.upgrade(chosen)'),true);
run(`reset();Strategy.selectMap('narrows');`);assert.equal(run('Battlefield.crossings.length'),2);assert.equal(run('Battlefield.blocked(1260,2510)'),true);assert.equal(run('Battlefield.blocked(840,2510)'),false);run(`begin()`);assert.equal(run(`Strategy.selectMap('verdant')`),false);
run(`reset();begin();$('#skillQ').onclick();ui();if(!hero.q||+$('#qCooldown').textContent!==Math.ceil(hero.q))throw Error('Q cooldown display');$('#skillE').onclick();ui();if(!hero.e||+$('#eCooldown').textContent!==Math.ceil(hero.e))throw Error('E cooldown display');for(let i=0;i<400;i++)step(.05);ui();if($('#qCooldown').textContent!==''||$('#qReady').textContent!=='READY')throw Error('Ready ability display');`);
// Verify actual captured pointer and keyboard handlers, rather than only helper functions.
run(`hero.x=1260;hero.y=2200;updateCamera();var targetEnemy=unit(1,'soldier',1320,2200);units.push(targetEnemy);`);
click(run('1320-camera.x'),run('2200-camera.y'));assert.equal(run('Strategy.focus===targetEnemy'),true);run(`hero.cd=0;for(let i=0;i<12;i++)step(.05);`);assert.ok(run('targetEnemy.hp')<110,'explicit target attacked');
for(const {callback} of events.get('document:keydown'))callback({key:'h',code:'KeyH',repeat:false,preventDefault(){}});run(`keys.clear();`);const position=run('hero.y');run('step(.1)');assert.equal(run('hero.y'),position,'hold stays still');
run(`var friendly=buildings.find(b=>b.team===0);hero.x=friendly.x;hero.y=friendly.y;updateCamera();`);click(run('friendly.x-camera.x'),run('friendly.y-camera.y'));assert.equal(run(`target===null`),true);
run(`reset();begin();gold=5000;build('siege');placeBuilding(1560,4680);for(let i=0;i<650;i++)step(.05);`);assert.ok(run(`units.some(u=>u.team===0&&u.type==='siege')`));
run(`var engine=unit(0,'siege',840,2200),defense=makeBuilding(1,'tower',840,2000);units.push(engine);buildings.push(defense);attack(engine,defense);`);assert.equal(run(`projectiles[projectiles.length-1].melee`),false,'siege has traveling projectile');assert.equal(run(`siegeSupport(defense)`),true,'siege unit removes backdoor protection');
// Enemy progression uses the same point caps and class milestones as the player.
run(`enemyGainXP(100000)`);assert.equal(run('enemyHero.level'),20);assert.ok(run('Object.values(enemyHero.talents).reduce((a,b)=>a+b,0)')===19);assert.ok(run('enemyHero.path===0||enemyHero.path===1'));
run(`reset();begin();if(W!==2520||H!==5040)throw Error('Expanded world dimensions');hero.x=W-50;hero.y=H-50;updateCamera();if(camera.x!==W-VW||camera.y!==H-VH)throw Error('Expanded camera bounds');reset();begin();const renderSprite=PixelArt.draw;let playerScale=0;PixelArt.draw=(ctx,name,x,y,scale,options)=>{if(name===champions[selectedHero].art&&x===hero.x&&y===hero.y)playerScale=scale;};draw();PixelArt.draw=renderSprite;if(playerScale!==2.8)throw Error('Smaller player sprite');`);
for(const map of ['verdant','narrows'])run(`reset();Strategy.selectMap('${map}');for(const bridge of Battlefield.crossings){const walker={x:bridge.x,y:2420};Battlefield.move(walker,bridge.x,2620);if(walker.y!==2620)throw Error('Expanded crossing blocked');}for(const direction of [0,1]){const start=direction?ENEMY:HOME,finish=direction?HOME:ENEMY,marcher={x:start.x,y:start.y};for(let i=0;i<4000&&dist(marcher,finish)>25;i++){const goal=Battlefield.route(marcher,finish),d=dist(marcher,goal)||1;Battlefield.move(marcher,marcher.x+(goal.x-marcher.x)/d*5.2,marcher.y+(goal.y-marcher.y)/d*5.2);}if(dist(marcher,finish)>25)throw Error('Expanded map route failed');}`);
// Re-run the original 12 solo dive cases and supported push with the new systems loaded.
const baseTests=fs.readFileSync('verify.cjs','utf8'),siegeStart=baseTests.indexOf('function siegeTrial('),siegeEnd=baseTests.indexOf("console.log('SIEGE BALANCE",siegeStart);run('{'+baseTests.slice(siegeStart,siegeEnd)+'}');
for(const map of ['verdant','narrows'])for(const id of ['warden','ranger','arcanist','shade']){run(`reset();selectedHero='${id}';Strategy.selectMap('${map}');reset();begin();for(let i=0;i<${simulationTicks}&&!ended;i++)step(.05);draw();`);assert.ok(run('Number.isFinite(hero.hp)&&Number.isFinite(gold)&&units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y))'),`${map} ${id} simulation`);}
run(`reset();begin();units.find(u=>u.team===1&&u.type==='king').hp=0;step(.05);`);// Report is rendered into the created panel.
assert.ok([...nodes.values()].some(n=>String(n.innerHTML).includes('BATTLE REPORT')),'end-of-match report');
run(`reset()`);assert.equal(run('Strategy.stats.deaths'),0);assert.equal(run('Object.keys(Strategy.ranks).length'),0);
console.log('PASS: merchant economy/caps, hero paths, timed construction, tier prerequisites/repair, two-map collision, pointer targeting/hold, siege production/projectiles/support, enemy progression, battle reports, reset, eight '+simulationTicks*.05+'-second simulations');



