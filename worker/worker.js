// Big Ears daily nudge: stores push subscriptions and sends one empty push a day.
// The phone's service worker picks the words (it knows your streak), so nothing personal is stored here.
const APP='https://jalthouse2.github.io/big-ears-trainer/';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...cors,'Content-Type':'application/json'}});
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const enc=new TextEncoder();
async function hash(s){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32)}

async function vapid(env){
  let v=await env.SUBS.get('vapid',{type:'json'});
  if(!v){const k=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
    v={pub:b64u(await crypto.subtle.exportKey('raw',k.publicKey)),priv:await crypto.subtle.exportKey('jwk',k.privateKey)};
    await env.SUBS.put('vapid',JSON.stringify(v))}
  return v}
async function jwt(env,aud){const v=await vapid(env);
  const h=b64u(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'}))),p=b64u(enc.encode(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+12*3600,sub:APP})));
  const key=await crypto.subtle.importKey('jwk',v.priv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(h+'.'+p));
  return {t:h+'.'+p+'.'+b64u(sig),k:v.pub}}
async function send(env,rec){const ep=rec.sub.endpoint,aud=new URL(ep).origin,{t,k}=await jwt(env,aud);
  const r=await fetch(ep,{method:'POST',headers:{TTL:'43200',Urgency:'normal','Content-Length':'0',Authorization:`vapid t=${t}, k=${k}`}});
  return r.status}

function local(tz){const f=new Intl.DateTimeFormat('en-GB',{timeZone:tz||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',weekday:'short',hour12:false});
  const o={};for(const x of f.formatToParts(new Date()))o[x.type]=x.value;
  return {date:`${o.year}-${o.month}-${o.day}`,mins:(+o.hour%24)*60+(+o.minute),day:o.weekday.slice(0,2).toUpperCase()}}

async function tick(env){let cursor;do{const l=await env.SUBS.list({prefix:'sub:',cursor});cursor=l.list_complete?null:l.cursor;
  for(const key of l.keys){const rec=await env.SUBS.get(key.name,{type:'json'});if(!rec)continue;
    const L=local(rec.tz),[h,m]=(rec.time||'18:00').split(':').map(Number),at=h*60+m;
    if(!(rec.days||[]).includes(L.day))continue;
    if(L.mins<at||L.mins>at+120)continue;                 // within two hours after the chosen time
    if(rec.lastSent===L.date||rec.lastDone===L.date)continue; // one a day, none once you've practised
    const st=await send(env,rec);
    if(st===404||st===410){await env.SUBS.delete(key.name);continue}
    rec.lastSent=L.date;rec.lastStatus=st;await env.SUBS.put(key.name,JSON.stringify(rec))}}while(cursor)}

export default{
  async fetch(req,env){const u=new URL(req.url);if(req.method==='OPTIONS')return new Response(null,{headers:cors});
    try{
      if(u.pathname==='/vapid')return json({key:(await vapid(env)).pub});
      if(req.method!=='POST')return json({ok:true,app:'big-ears-push'});
      const b=await req.json();
      if(u.pathname==='/sub'){if(!b.sub||!b.sub.endpoint)return json({error:'no subscription'},400);
        const id=await hash(b.sub.endpoint),old=await env.SUBS.get('sub:'+id,{type:'json'})||{};
        await env.SUBS.put('sub:'+id,JSON.stringify({...old,sub:b.sub,time:b.time||'18:00',tz:b.tz||'UTC',days:b.days||['MO','TU','WE','TH','FR','SA','SU']}));return json({id})}
      const key='sub:'+(b.id||''),rec=await env.SUBS.get(key,{type:'json'});if(!rec)return json({error:'unknown'},404);
      if(u.pathname==='/done'){rec.lastDone=b.date;await env.SUBS.put(key,JSON.stringify(rec));return json({ok:true})}
      if(u.pathname==='/unsub'){await env.SUBS.delete(key);return json({ok:true})}
      if(u.pathname==='/test'){const st=await send(env,rec);return json({status:st})}
      return json({error:'not found'},404)
    }catch(e){return json({error:String(e)},500)}},
  async scheduled(ev,env,ctx){ctx.waitUntil(tick(env))}};
