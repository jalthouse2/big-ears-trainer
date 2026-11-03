// Offline support: the app shell is cached; the network is tried first so updates arrive.
const CACHE='big-ears-v50';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='be-state').map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  const same=new URL(r.url).origin===location.origin;
  e.respondWith(fetch(r,same?{cache:'no-cache'}:{}).then(res=>{if(res.ok&&new URL(r.url).origin===location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});

// Daily nudge from a push (no payload needed): the line follows the streak the app last saved.
const LINES={keep:["Your {n}-day streak is getting nervous. {d} minutes keeps it calm.","Day {n1} is waiting. Don't leave your streak hanging.","Your {n}-day streak called. It wants a sequel."],
  any:["Your ears getting smaller? {d} minutes fixes that.","Your 1 misses you. So does your 5.","Big ears aren't born. They're trained. {d} minutes today?","Somewhere a 6 is waiting to be named.","Ears go soft fast. Keep yours big.","The drone's warmed up. Are you?"],
  lost:["Your streak took a nap. Wake it up with one gig.","Your ears called. They want their workout back.","No guilt. Just {d} minutes and a fresh streak."]};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
self.addEventListener('push',e=>{e.waitUntil((async()=>{let st={streak:0,lastGoal:null,daily:15};
  try{const c=await caches.open('be-state'),r=await c.match('state');if(r)st=await r.json()}catch(_){}
  let body=null;try{body=e.data&&e.data.text()}catch(_){}
  if(!body){const y=new Date();y.setDate(y.getDate()-1);const live=st.lastGoal===ymd(y),pool=live&&st.streak>=1?LINES.keep:st.streak>=2&&!live?LINES.lost:LINES.any;
    body=pool[Math.floor(Math.random()*pool.length)].replace(/\{n\}/g,Math.max(1,st.streak)).replace(/\{n1\}/g,Math.max(1,st.streak)+1).replace(/\{d\}/g,st.daily||15)}
  return self.registration.showNotification('Big Ears',{body,icon:'icon-192.png',badge:'icon-192.png',tag:'daily'})})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(ws=>ws.length?ws[0].focus():clients.openWindow('./')))});
