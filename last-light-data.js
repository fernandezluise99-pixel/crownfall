/* Original prototype content; shared by browser and deterministic rules tests. */
(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;else root.LastLightData=data;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const C={
 revolver:{name:'Service Revolver',type:'weapon',cost:2,damage:4,ammo:6,fire:1,art:'pistol',text:'Deploy a reliable sidearm. Fire once per turn at any enemy.'},
 carbine:{name:'Patrol Carbine',type:'weapon',cost:3,damage:7,ammo:4,fire:2,art:'rifle',text:'A steady long-range weapon. Fire once per turn at any enemy.'},
 shotgun:{name:'Breach Gun',type:'weapon',cost:2,damage:11,ammo:3,fire:2,reach:'breach',art:'shotgun',text:'Heavy damage, but can only target enemies inside a broken barricade.'},
 crowbar:{name:'Wrecking Bar',type:'attack',cost:1,damage:7,reach:'breach',pierce:1,art:'crowbar',text:'Deal 7 damage, ignoring 1 armor. Breached enemies only. Discard after use.'},
 reload:{name:'Spare Magazine',type:'reload',cost:1,art:'ammo',text:'Fully reload one deployed weapon. Does not reset its once-per-turn firing limit.'},
 boards:{name:'Salvaged Boards',type:'repair',cost:1,heal:7,art:'boards',text:'Repair an intact barricade by 7, up to its maximum durability.'},
 brace:{name:'Steel Bracing',type:'fortify',cost:2,armor:1,heal:3,art:'shield',text:'Give an intact barricade +1 armor, up to 3. Restore 3 durability.'},
 snare:{name:'Snare Wire',type:'stun',cost:1,turns:2,art:'trap',text:'An enemy skips its next two activations. Repeated snares do not stack.'},
 molotov:{name:'Bottle Fire',type:'blast',cost:2,damage:5,art:'fire',text:'Deal 5 damage to every enemy in one lane, ignoring armor.'},
 scope:{name:'Penetrator Kit',type:'mod',cost:1,art:'scope',text:'Attach to a weapon: +2 damage and ignore 1 armor. One modification per weapon.'},
 rations:{name:'Field Rations',type:'tempo',cost:3,art:'rations',text:'Increase AP per turn by 1, up to 6. Starts next turn. This card is exhausted for this battle.'},
 scavenge:{name:'Search the Shelves',type:'draw',cost:1,draw:2,art:'pack',text:'Draw up to 2 cards without exceeding the 8-card hand limit.'},
 medkit:{name:'First Aid',type:'heal',cost:2,heal:10,art:'medkit',text:'Restore 10 survivor health, up to 50.'},
 rifle:{name:'Breaker Rifle',type:'weapon',cost:3,damage:8,ammo:3,fire:2,pierce:2,art:'rifle',text:'Fire once per turn. Ignore 2 enemy armor. Any range.'},
 shock:{name:'Flash Canister',type:'laneStun',cost:2,turns:1,art:'flash',text:'Every enemy in a lane skips its next activation.'},
 rebuild:{name:'Emergency Shoring',type:'rebuild',cost:2,heal:6,art:'boards',text:'Rebuild a destroyed barricade at 6 durability only if its breach is empty.'},
 weld:{name:'Welded Plate',type:'fortify',cost:1,armor:1,heal:4,art:'shield',ally:'mechanic',text:'Mechanic: +1 barricade armor, up to 3; repair 4.'},
 patch:{name:'Field Repairs',type:'repair',cost:1,heal:10,art:'tools',ally:'mechanic',text:'Mechanic: repair 10 durability on an intact barricade.'},
 salvage:{name:'Ammo Recovery',type:'reload',cost:0,art:'ammo',ally:'mechanic',text:'Mechanic: fully reload one deployed weapon for no AP.'},
 quickfix:{name:'Rescue the Frame',type:'rebuild',cost:1,heal:8,art:'boards',ally:'mechanic',text:'Mechanic: rebuild an empty breach at 8 durability.'},
 smoke:{name:'Smoke Screen',type:'laneStun',cost:1,turns:2,art:'smoke',ally:'scout',text:'Scout: every enemy in a lane skips two activations.'},
 mark:{name:'Mark the Threat',type:'attack',cost:1,damage:5,pierce:99,art:'scope',ally:'scout',text:'Scout: deal 5 damage to any enemy, ignoring all armor.'},
 supply:{name:'Hidden Supplies',type:'draw',cost:0,draw:2,art:'pack',ally:'scout',text:'Scout: draw up to 2 cards for no AP. Hand limit 8.'},
 sidestep:{name:'Trip Line',type:'stun',cost:0,turns:1,art:'trap',ally:'scout',text:'Scout: one enemy skips its next activation for no AP.'}
 };
 const allies={mechanic:{name:'Mara Voss',role:'THE MECHANIC',art:'tools',quote:'If it still has a frame, I can hold it together.',description:'Stronger repairs, cheaper armor and an emergency rebuild.',cards:['weld','patch','patch','salvage','quickfix']},scout:{name:'Eli Reed',role:'THE SCOUT',art:'scope',quote:'You do not have to outrun them. Just buy another minute.',description:'Delay threats, find supplies and cut through armor.',cards:['smoke','mark','supply','supply','sidestep']}};
 const enemies={walker:{name:'Drifter',hp:9,attack:4,armor:0,spawn:5,art:'walker'},runner:{name:'Rushling',hp:6,attack:6,armor:0,spawn:4,art:'runner'},armored:{name:'Ironback',hp:16,attack:5,armor:2,spawn:3,art:'armored'},caller:{name:'Chorus',hp:10,attack:3,armor:0,spawn:3,art:'caller',support:true}};
 const missions=[
 {id:'garage',name:'The Last Garage',chapter:'01',tag:'HOLD THE DOORS',description:'A dead engine. A lantern. Five entrances between you and the dark.',story:'Mara has found enough fuel to reach the floodplain. Keep the garage standing while the convoy gets moving.',horde:['walker','walker','walker','runner','walker','walker','runner','walker','armored','walker','runner','walker'],attempts:1,barrier:14},
 {id:'store',name:'Deadwater Supply',chapter:'02',tag:'BREAK THE ARMOR',description:'Supplies wait behind the shutters. So does something wearing steel.',story:'The water has taken the road. Find medical supplies before crossing the flooded district. Ironbacks shrug off weak attacks.',horde:['walker','walker','runner','armored','walker','runner','armored','caller','walker','walker','runner','armored','walker','caller','runner','walker','armored','walker'],attempts:2,barrier:13},
 {id:'relay',name:'Signal at Dusk',chapter:'03',tag:'LIGHT THE BEACON',description:'One last broadcast. Make the night wait long enough to hear it.',story:'A voice answers from the evacuation fleet. Keep every entrance covered until the relay is clear. The Chorus makes other enemies hit harder.',horde:['walker','walker','runner','armored','caller','walker','runner','armored','walker','caller','runner','walker','armored','caller','walker','runner','armored','walker','caller','runner','walker','armored'],attempts:2,barrier:12}
 ];
 const starter=['revolver','revolver','carbine','carbine','shotgun','crowbar','crowbar','reload','reload','boards','boards','brace','snare','snare','molotov','scope','rations','scavenge','scavenge','medkit'];
 const baseIds=Object.keys(C).filter(id=>!C[id].ally),collection=Object.fromEntries(baseIds.map(id=>[id,starter.filter(k=>k===id).length]));
 return {cards:C,allies,enemies,missions,starter,baseIds,collection,version:1};
});
