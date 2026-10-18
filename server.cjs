/* In-memory room service. All match actions are validated and simulated here. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Rules=require('./multiplayer-core.js');
function createApp(options={}){
 const rooms=new Map(),sessions=new Map(),rates=new Map(),root=path.join(__dirname,'dist'),roomLimit=options.roomLimit||12;
 const token=()=>crypto.randomBytes(24).toString('hex'),safeName=value=>String(value||'Commander').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,20)||'Commander';
 const fail=(message,status=400)=>Object.assign(new Error(message),{status});
 function member(room,name,hero){if(room.members.length>=4)throw fail('This room already has four players.',409);if(room.phase!=='lobby')throw fail('This battle has already started.',409);const p={id:'h'+token().slice(0,16),token:token(),name:safeName(name),hero:Object.hasOwn(Rules.HEROES,hero)?hero:'warden',ready:false,connected:false,lastSeen:Date.now(),stream:null,window:Date.now(),actions:0};room.members.push(p);sessions.set(p.token,{room,p});return p;}
 function publicRoom(room){return {code:room.code,phase:room.phase,host:room.host,members:room.members.map(p=>({id:p.id,name:p.name,hero:p.hero,ready:p.ready,connected:p.connected})),world:room.world?.snapshot()||null};}
 function broadcast(room){const data='data: '+JSON.stringify(publicRoom(room))+'\n\n';for(const p of room.members){if(p.stream&&!p.stream.destroyed){if(p.stream.writableLength>512000){p.stream.destroy();continue;}p.stream.write(data);}}}
 function drop(p,room){if(p.stream)p.stream.end();sessions.delete(p.token);room.members=room.members.filter(m=>m!==p);if(room.world&&!room.world.finished)room.world.eliminate(room.world.players.find(a=>a.id===p.id)?.team);if(room.host===p.id)room.host=room.members.find(m=>m.connected)?.id||room.members[0]?.id;broadcast(room);}
 async function json(req){let length=0,text='';for await(const chunk of req){length+=chunk.length;if(length>16384)throw fail('Request too large.',413);text+=chunk;}try{return JSON.parse(text||'{}');}catch{throw fail('Invalid JSON.');}}
 function respond(res,status,body){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));}
 const server=http.createServer(async(req,res)=>{try{
   const url=new URL(req.url,'http://localhost'),origin=req.headers.origin,own='https://'+req.headers.host;
   const allowed=[own,'http://'+req.headers.host,'https://crownfall-dyhx.onrender.com',process.env.CLIENT_ORIGIN].filter(Boolean);
   if(origin&&allowed.includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}else if(origin&&url.pathname.startsWith('/api/'))throw fail('Origin not allowed.',403);
   if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'});res.end();return;}
   if(url.pathname==='/health'){respond(res,200,{ok:true,rooms:rooms.size,version:1});return;}
   if(req.method==='POST'&&(url.pathname==='/api/create'||url.pathname==='/api/join')){
     const address=req.socket.remoteAddress,now=Date.now();let rate=rates.get(address);if(!rate||now-rate.time>60000)rates.set(address,rate={time:now,count:0});if(++rate.count>30)throw fail('Too many requests. Try again in a minute.',429);
     const body=await json(req);let room;if(url.pathname==='/api/create'){if(rooms.size>=roomLimit)throw fail('The battle server is full. Please try again later.',503);let code;do{code=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase();}while(rooms.has(code));room={code,phase:'lobby',host:null,members:[],world:null,created:now};rooms.set(code,room);}else{room=rooms.get(String(body.code||'').trim().toUpperCase());if(!room)throw fail('Room not found. Check the six-character code.',404);}
     const p=member(room,body.name,body.hero);room.host=room.host||p.id;respond(res,200,{token:p.token,id:p.id,code:room.code,room:publicRoom(room)});broadcast(room);return;
   }
   if(url.pathname.startsWith('/api/')){
     const credential=(req.headers.authorization||'').replace(/^Bearer /,'')||(url.pathname==='/api/events'?url.searchParams.get('token'):null),session=sessions.get(credential);if(!session)throw fail('Session expired. Join the room again.',401);const {room,p}=session;p.lastSeen=Date.now();
     if(req.method==='GET'&&url.pathname==='/api/events'){
       const old=p.stream;p.stream=res;if(old)old.end();p.connected=true;res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(': connected\n\n');res.on('close',()=>{if(p.stream===res){p.connected=false;p.stream=null;p.lastSeen=Date.now();if(room.world){const actor=room.world.players.find(a=>a.id===p.id);if(actor)actor.input={dx:0,dy:0};}if(room.host===p.id)room.host=room.members.find(m=>m.connected&&m!==p)?.id||p.id;}});broadcast(room);return;
     }
     if(req.method!=='POST'||url.pathname!=='/api/action')throw fail('Not found.',404);
     const now=Date.now();if(now-p.window>1000){p.window=now;p.actions=0;}if(++p.actions>40)throw fail('Commands sent too quickly.',429);
     const action=await json(req);let accepted=false;
     if(action.type==='leave'){drop(p,room);respond(res,200,{ok:true});return;}
     if(room.phase==='lobby'){
       if(action.type==='ready'){p.ready=action.ready===true;accepted=true;}
       if(action.type==='hero'&&Object.hasOwn(Rules.HEROES,action.hero)){p.hero=action.hero;p.ready=false;accepted=true;}
       if(action.type==='start'&&room.host===p.id){if(room.members.length<2)throw fail('At least two players are needed.');if(room.members.some(p=>!p.ready||!p.connected))throw fail('Every player must be connected and ready.');room.world=new Rules.World(room.members);room.phase='playing';accepted=true;}
     }else if(action.type==='lobby'&&room.host===p.id&&room.world.finished){room.phase='lobby';room.world=null;for(const m of room.members)m.ready=false;accepted=true;}
     else accepted=room.world.command(p.id,action);
     if(!accepted)throw fail('Action unavailable: check gold, level, position, or cooldown.');respond(res,200,{ok:true});if(room.phase==='lobby'||action.type==='start')broadcast(room);return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD')throw fail('Not found.',404);
   const relative=decodeURIComponent(url.pathname==='/'?'index.html':url.pathname).replace(/^\/+/,''),file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw fail('Not found.',404);
   const stat=await fs.promises.stat(file).catch(()=>null);if(!stat?.isFile())throw fail('Not found.',404);
   const type={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type,'Content-Length':stat.size,'Cache-Control':'public, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 }catch(error){if(!res.headersSent)respond(res,error.status||500,{error:error.status?error.message:'Server error. Please reconnect.'});else res.end();}});
 let ticks=0;const timer=setInterval(()=>{const now=Date.now();for(const [code,room]of rooms){if(room.phase==='playing'&&room.world&&!room.world.finished){room.world.step(.05);if(room.world.finished)room.phase='finished';}for(const p of [...room.members])if(!p.connected&&now-p.lastSeen>90000)drop(p,room);if(!room.members.length||now-room.created>3*60*60*1000){for(const p of room.members){sessions.delete(p.token);p.stream?.end();}rooms.delete(code);continue;}if(ticks%2===0)broadcast(room);}if(ticks++%1200===0)for(const [key,rate]of rates)if(now-rate.time>60000)rates.delete(key);},50);timer.unref();
 server.requestTimeout=15000;server.headersTimeout=10000;
 return {server,rooms,close(){clearInterval(timer);for(const s of sessions.values())s.p.stream?.end();server.closeAllConnections();return new Promise(resolve=>server.close(resolve));}};
}
if(require.main===module){const app=createApp();app.server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Crownfall online server listening'));process.on('SIGTERM',()=>app.close().then(()=>process.exit(0)));}
module.exports={createApp};
