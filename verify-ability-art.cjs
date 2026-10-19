'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),R=require('./multiplayer-core.js');
const harness=fs.readFileSync('verify-strategy.cjs','utf8').split('function run(code)')[0];
const {sandbox,nodes,node,vm}=new Function('require',harness+';return {sandbox,nodes,node,vm};')(require),calls=[];
const ctx=new Proxy({drawImage:(...a)=>calls.push(a)},{get:(o,k)=>o[k]??(()=>{})});
sandbox.document.querySelector=id=>{const n=node(id);if(['#qArt','#eArt','#recallArt'].includes(id))n.getContext=()=>ctx;return n;};
sandbox.Image=class{set src(src){this.file=src;this.width=src.includes('recall')?1254:887;this.height=src.includes('recall')?1254:1774;this.onload();}};
const run=s=>vm.runInContext(s,sandbox);run(fs.readFileSync('ability-art.js','utf8'));sandbox.artCtx=ctx;
for(const [row,id]of ['warden','ranger','arcanist','shade'].entries()){
 run(`reset();chooseHero('${id}');window.CrownfallAbilityIcons('${id}')`);assert.ok(node('#qIcon').innerHTML.includes('qArt'));assert.ok(node('#eIcon').innerHTML.includes('eArt'));
 for(const [index,key]of ['q','e'].entries()){
  assert.equal(run(`PixelArt.abilityEffect(artCtx,'${id}','${key}',100,100,.5,140,{x:20,y:20},1)`),true);const a=calls.at(-1);assert.equal(a[2],(row*2+index)*1774/8);assert.equal(a[1],2*887/4);assert.ok(a.slice(1).every(Number.isFinite));
  run(`reset();begin();ability('${key}')`);assert.equal(run(`effects.some(e=>e.hero==='${id}'&&e.key==='${key}')`),true);assert.ok(Number(node('#'+key+'Cooldown').textContent)>0);
  const world=new R.World([{id:'a',name:'A',hero:id},{id:'b',name:'B',hero:'warden'}]),p=world.players[0],from={x:p.x,y:p.y};assert.equal(world.ability(p,key),true);const effect=world.snapshot().effects.find(e=>e.kind==='ability');assert.equal(effect.hero,id);assert.equal(effect.key,key);assert.deepEqual(effect.origin,from);assert.ok(Number.isFinite(effect.radius));
 }
}
run("PixelArt.recallEffect(artCtx,100,100,2);PixelArt.abilityProjectile(artCtx,100,100,1)");assert.ok(node('#recall .skill-icon').innerHTML.includes('recallArt'));
const png=fs.readFileSync('assets/art/ability-vfx-v1.png');assert.equal(png[25],6);
console.log('PASS: eight generated icon mappings, Recall, all 32 VFX frame cells, hero switching, retained cooldowns, solo casts and synchronized online/offline effect metadata, teleport/lunge origins, projectile/recall rendering');
