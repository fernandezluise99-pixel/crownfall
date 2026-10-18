'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const harness=fs.readFileSync('verify-strategy.cjs','utf8').split('function run(code)')[0];
const {sandbox,nodes,node,vm}=new Function('require',harness+';return {sandbox,nodes,node,vm};')(require);
const intervals=[],run=s=>vm.runInContext(s,sandbox);
Object.assign(sandbox,{URL,URLSearchParams,location:new URL('https://offline.invalid'),performance,sessionStorage:{getItem(){return null},removeItem(){}},setInterval:fn=>intervals.push(fn),setTimeout,fetch(){throw Error('Offline mode attempted network request');}});
sandbox.document.querySelector=id=>{const created=[...nodes.values()].find(n=>n.id===id.slice(1));if(created)nodes.set(id,created);const n=node(id);n.style.setProperty=(k,v)=>n.style[k]=v;return n;};
for(const file of ['multiplayer-core.js','skirmish-ai.js','multiplayer.js','mobile-controls.js'])run(fs.readFileSync(file,'utf8'));
async function main(){assert.equal(run("Strategy.selectMap('kingdoms')"),true);run('begin();draw()');let w=sandbox.window.CrownfallOnline.world;assert.equal(w.players.length,4);assert.equal(w.units.filter(u=>u.type==='king').length,4);assert.equal(sandbox.window.CrownfallOnline.local,true);assert.equal(node('#difficultyBadge').textContent,'SOLO · Standard');assert.equal(run("Strategy.selectMap('verdant')"),false);
 const before=w.players[0].x;run("keys.add('d')");intervals.forEach(fn=>fn());run('step(.2)');assert.ok(w.players[0].x>before);run('keys.clear();togglePause()');const t=w.time;run('step(.2)');assert.equal(w.time,t);node('#pause').onclick();run('step(.05)');assert.ok(w.time>t);run("ability('q')");assert.ok(w.players[0].q>0);
 for(let i=0;i<1800;i++)run('step(.05)');assert.ok(w.players.slice(1).every(p=>p.gold>=0));assert.ok(w.players.slice(1).every(p=>w.buildings.filter(b=>b.team===p.team).length>=3),'each AI expands legally');assert.ok(w.players.slice(1).some(p=>Math.hypot(p.x-2100,p.y-400)>500));run('draw()');
 w.eliminate(1);w.eliminate(2);w.eliminate(3);run('step(.05)');assert.ok(sandbox.document.querySelector('#onlinePanel').innerHTML.includes('VICTORY'));assert.equal(run('paused'),true);
 await sandbox.window.CrownfallOnline.leave();assert.equal(sandbox.window.CrownfallOnline.active,false);assert.equal(node('#difficultySelect').disabled,false);run("Strategy.selectMap('verdant');begin();step(.05)");assert.equal(run('started'),true);assert.ok(run('clock')>0);
 run("reset();Strategy.selectMap('kingdoms');begin()");w=sandbox.window.CrownfallOnline.world;w.eliminate(0);run('step(.05)');assert.ok(sandbox.document.querySelector('#onlinePanel').innerHTML.includes('YOUR KINGDOM HAS FALLEN'));await sandbox.window.CrownfallOnline.leave();
 for(let tier=0;tier<8;tier++){run(`var trial=new OnlineRules.World(['warden','ranger','arcanist','shade'].map((hero,i)=>({id:'p'+i,name:'Commander '+i,hero})));var aiTrial=new window.CrownfallSkirmishAI(trial,${tier});for(let i=0;i<1200;i++){aiTrial.step(.05);trial.step(.05);}`);assert.equal(run('trial.players.every(p=>p.gold>=0&&Number.isFinite(p.hp)&&Number.isFinite(p.x)&&Number.isFinite(p.y))'),true);assert.equal(run('trial.players.slice(1).every(p=>trial.buildings.filter(b=>b.team===p.team).length>=3)'),true);}
 console.log('PASS: offline four-kingdom start, three AI economies/expansion at all eight difficulties, movement, skills, pause/resume, map lock, victory/defeat, exit and original solo restoration');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
