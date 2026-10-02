const {Sim,loadLevel,cloneSim}=require('./boxel');
let a0=+process.argv[2]||1;const rnd=()=>{a0|=0;a0=a0+0x6D2B79F5|0;let t=Math.imul(a0^a0>>>15,1|a0);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const T=+process.argv[3]||60000;const t0=Date.now();
const root=new Sim(loadLevel(29));root.h=null;
const arc=new Map();const key=s=>{const b=s.player.body;return [Math.floor(b.position.x/16),Math.floor(b.position.y/16),Math.round(b.velocity.x/1.5),Math.round(b.velocity.y/1.5),s.player.jumpReady?1:0,s.player.scale&&s.player.scale.x].join()};
arc.set(key(root),{s:root,t:0});
let bestd=1e9,bestH=null,bestP=null;let minx=1e9,maxy=-1e9,maxx=-1e9,miny=1e9,fin=null,cnt=0;
while(Date.now()-t0<T){
 const ks=[...arc.keys()];let e;
 if(rnd()<0.5){e=arc.get(ks[Math.floor(rnd()*ks.length)]);}else{let bs=1e18;for(let q=0;q<12;q++){const c=arc.get(ks[Math.floor(rnd()*ks.length)]);const p=c.s.player.body.position;const d=Math.hypot(p.x-1512,p.y+48)+c.t*0.3;if(d<bs){bs=d;e=c}}}
 let s=cloneSim(e.s);s.h=e.s.h;
 const pj=0.03+rnd()*0.2;
 for(let i=0;i<40;i++){const j=s.player.jumpReady&&rnd()<pj;s.step({jump:j});if(j)s.h={t:s.tick-1,p:s.h};
  if(s.dead)break;
  if(s.finished){fin={tick:s.finishTick+1,h:s.h};break}
  const b=s.player.body;cnt++;
  if(b.position.y>160&&!global.E1){global.E1={t:s.tick,x:b.position.x,y:b.position.y,vy:b.velocity.y,h:s.h}}
  if(b.position.x>1580&&!global.E2){global.E2={t:s.tick,x:b.position.x,y:b.position.y,h:s.h}}
  if(b.position.x<minx)minx=b.position.x;if(b.position.y>maxy)maxy=b.position.y;if(b.position.x>maxx)maxx=b.position.x;if(b.position.y<miny)miny=b.position.y;
  const dd=Math.hypot(b.position.x-1512,b.position.y+48);if(dd<bestd){bestd=dd;bestH=s.h;bestP=[b.position.x|0,b.position.y|0,s.tick]}
  const k=key(s);const o=arc.get(k);if(!o||o.t>s.tick){const c=cloneSim(s);c.h=s.h;arc.set(k,{s:c,t:s.tick})}}
 if(fin)break;
}
console.log('cells',arc.size,'sims',cnt,'minx',minx|0,'maxx',maxx|0,'maxy(down)',maxy|0,'miny',miny|0,fin?('FIN '+fin.tick):'nofin');

const L=h=>{const o=[];while(h){o.push(h.t);h=h.p}return o.reverse()};
for(const E of [global.E1,global.E2]) if(E) console.log(E.t,E.x|0,E.y|0,E.vy,JSON.stringify(L(E.h)));
console.log('bestd',bestd|0,JSON.stringify(bestP),JSON.stringify(bestH?L(bestH):null));if(fin)console.log('FINJ',JSON.stringify(L(fin.h)));