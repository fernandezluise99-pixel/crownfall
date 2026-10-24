/* Original illustrated card set. Rules and controls remain ordinary accessible HTML. */
(()=>{
 'use strict';
 const entries={};
 for(const id of Object.keys(LastLightData.cards))entries['card-'+id]='last-light-card-'+id+'-v1.jpg';
 for(const id of Object.keys(LastLightData.enemies))entries['enemy-'+id]='last-light-enemy-'+id+'-v1.jpg';
 for(const id of Object.keys(LastLightData.allies))entries['ally-'+id]='last-light-ally-'+id+'-v1.jpg';
 for(const m of LastLightData.missions)entries['mission-'+m.id]='last-light-mission-'+m.id+'-v1.jpg';
 entries.board='last-light-board-v1.jpg';entries['card-back']='last-light-card-back-v1.jpg';
 const image=(key,eager=false)=>entries[key]?'<img class="ll-illustration" src="assets/art/'+entries[key]+'" alt="" aria-hidden="true" loading="'+(eager?'eager':'lazy')+'" decoding="async" draggable="false">':'';
 document.addEventListener('error',event=>{const target=event.target;if(target?.matches?.('img.ll-illustration'))target.hidden=true;},true);
 function openCard(id){const d=LastLightData.cards[id],dialog=document.querySelector('#illustrationDetail');if(!d||!dialog?.showModal)return false;document.querySelector('#illustrationBody').innerHTML='<div class="detail-illustration">'+image('card-'+id,true)+'</div><div class="detail-heading"><span class="ap-cost">'+d.cost+'</span><div><span class="eyebrow">'+(d.ally?'ALLY / ':'')+d.type.toUpperCase()+'</span><h2 id="illustrationTitle">'+d.name+'</h2></div></div><p class="detail-rules">'+d.text+'</p>'+(d.type==='weapon'?'<p class="detail-statline">'+d.damage+' DAMAGE · '+d.ammo+' AMMUNITION · '+d.fire+' AP PER SHOT</p>':'');if(!dialog.open)dialog.showModal();return true;}
 const close=document.querySelector('#illustrationClose');if(close)close.onclick=()=>document.querySelector('#illustrationDetail').close();
 window.LastLightArt={entries,image,openCard};
})();
