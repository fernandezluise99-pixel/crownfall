'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const harness=fs.readFileSync('verify-strategy.cjs','utf8').split('function run(code)')[0];
const {sandbox,vm}=new Function('require',harness+';return {sandbox,vm};')(require);
const loaded=[];sandbox.Image=class{set src(src){this.file=src;this.width=src.includes('engine')?1536:1254;this.height=src.includes('engine')?1024:1254;loaded.push(src);this.onload();}};
vm.runInContext(fs.readFileSync('strategy-art.js','utf8'),sandbox);
const draws=[],ctx=new Proxy({drawImage:(...args)=>draws.push(args)},{get:(o,k)=>o[k]??(()=>{})});
for(const [dir,facing]of [Math.PI/2,-Math.PI/2,Math.PI,0].entries())for(const [row,action]of ['idle','attack'].entries()){sandbox.testCtx=ctx;vm.runInContext(`PixelArt.draw(testCtx,'siege',100,100,3,{action:'${action}',facing:${facing},progress:.5})`,sandbox);const a=draws.at(-1);assert.equal(a[1],dir*384);assert.equal(a[2],row*512);assert.ok(a.slice(1).every(Number.isFinite));}
vm.runInContext("PixelArt.draw(testCtx,'siegeWorkshop',50,50,6,{enemy:true});PixelArt.effect(testCtx,'siege',50,50,1,.5,44)",sandbox);assert.ok(draws.at(-2)[0].file.includes('workshop'));assert.ok(draws.at(-1)[0].file.includes('engine'));assert.equal(draws.at(-1)[3],80);
for(const file of ['siege-workshop-v1.png','siege-engine-v1.png']){const data=fs.readFileSync('assets/art/'+file);assert.equal(data.toString('ascii',1,4),'PNG');assert.equal(data[25],6,'RGBA asset');}
assert.ok(fs.readFileSync('game.js','utf8').includes("b.type==='siege'?'siegeWorkshop':b.type"));assert.ok(fs.readFileSync('multiplayer.js','utf8').includes("a.structure&&a.type==='siege'?'siegeWorkshop'"));
console.log('PASS: both generated RGBA PNGs, workshop/unit separation in solo and Four Kingdoms, four direction cells, idle/firing pose rows, projectile sprite sampling');
