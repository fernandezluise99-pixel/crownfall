/* Presentation only: original ability controls, icons, and cooldown indicators. */
(()=>{
  const paths={
    warden:['M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6z M6 13l4-3 3 6 3-4 3 1','M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6z M12 8v8 M8 12h8'],
    ranger:['M5 3q20 9 0 18 M5 3v18 M2 12h19 M17 8l4 4-4 4','M2 6h12 M4 11h16 M2 16h12 M15 3l6 8-6 8'],
    arcanist:['M13 2c3 6-1 7 2 10l3-4c8 12-10 20-13 8-1-4 2-7 4-9-1 7 7 6 4-5z','M3 5h6 M2 12h8 M3 19h6 M14 3l7 9-7 9 3-9z'],
    shade:['M20 2 7 13l4 4L22 4z M5 12l8 8 M8 17l-5 5 M3 19l2 3','M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13z M9 16c0 3 4 4 6 1']
  };
  const svg=path=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
  for(const [key,id]of [['q','skillQ'],['e','skillE']]){
    $('#'+id).innerHTML='<kbd>'+key.toUpperCase()+'</kbd><span class="skill-icon" aria-hidden="true"><span id="'+key+'Icon"></span><strong id="'+key+'Cooldown"></strong></span><span id="'+key+'cd" class="skill-name"></span><span class="skill-ready" id="'+key+'Ready">READY</span><small id="'+key+'desc"></small>';
  }
  $('#recall').innerHTML='<kbd>B</kbd><span class="skill-icon" aria-hidden="true">'+svg('M3 11 12 3l9 8 M6 10v11h12V10 M10 21v-7h4v7')+'</span><span class="skill-name">Recall</span><span class="skill-ready" id="recallState">RETURN</span><small>Return to your sanctuary after a 3 second channel. Moving or taking damage cancels.</small>';
  let painted=null;
  const previous=ui;
  ui=function(){previous();const c=champions[selectedHero];if(painted!==selectedHero){$('#qIcon').innerHTML=svg(paths[selectedHero][0]);$('#eIcon').innerHTML=svg(paths[selectedHero][1]);painted=selectedHero;}
    for(const [key,id,index]of [['q','skillQ',0],['e','skillE',1]]){const button=$('#'+id),remaining=hero[key],base=key==='q'?{warden:7,ranger:8,arcanist:9,shade:6}[selectedHero]:{warden:18,ranger:14,arcanist:10,shade:12}[selectedHero],maximum=base*cooldownMultiplier()*(selectedHero==='arcanist'&&hero.path===1?.85:1);button.style.setProperty?.('--cooldown',String(Math.min(1,remaining/maximum)));button.classList.toggle('cooling',remaining>0);$('#'+key+'Cooldown').textContent=remaining>0?String(Math.ceil(remaining)):'';$('#'+key+'cd').textContent=c[key];$('#'+key+'Ready').textContent=remaining>0?'COOLDOWN':'READY';button.setAttribute('aria-label',key.toUpperCase()+': '+c[key]+'. '+(remaining>0?Math.ceil(remaining)+' seconds remaining.':'Ready. ')+$('#'+key+'desc').textContent);}
    $('#recallState').textContent=recall>0?recall.toFixed(1)+'s':'RETURN';
  };
  ui();
})();
