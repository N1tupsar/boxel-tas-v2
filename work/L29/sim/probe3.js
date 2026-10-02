const {Sim,loadLevel,cloneSim}=require('./boxel');
let a0=+process.argv[2]||1;const rnd=()=>{a0|=0;a0=a0+0x6D2B79F5|0;let t=Math.imul(a0^a0>>>15,1|a0);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const T=+process.argv[3]||60000;const t0=Date.now();
const PRE=JSON.parse(process.argv[4]);const START=+process.argv[5];
const root=new Sim(loadLevel(29));const PJ=new Set(PRE);root.h=null;
while(root.tick<START){const j=PJ.has(root.tick);root.step({jump:j});if(j)root.h={t:root.tick-1,p:root.h}}
const door=s=>s.objects[12].body;
const pot=s=>{const b=s.player.body,d=door(s);return Math.hypot(b.position.x-1512,b.position.y+48)*0.5-(d.position.x-1448)*8-Math.abs(d.angle)*100};
const arc=new Map();const key=s=>{const b=s.player.body,d=door(s);return [Math.floor(b.position.x/12),Math.floor(b.position.y/12),Math.round(b.velocity.x/1.5),Math.round(b.velocity.y/1.5),s.player.jumpReady?1:0,Math.round(d.position.x),Math.round(d.angle*10)].join()};
arc.set(key(root),{s:root,t:root.tick,p:pot(root)});
let fin=null,best=1e9,bH=null,bi=null;
const L=h=>{const o=[];while(h){o.push(h.t);h=h.p}return o.reverse()};
while(Date.now()-t0<T&&!fin){
 const ks=[...arc.keys()];let e;
 if(rnd()<0.3)e=arc.get(ks[Math.floor(rnd()*ks.length)]);else{let bs=1e18;for(let q=0;q<10;q++){const c=arc.get(ks[Math.floor(rnd()*ks.length)]);const v=c.p+c.t*0.3;if(v<bs){bs=v;e=c}}}
 let s=cloneSim(e.s);s.h=e.s.h;const pj=0.03+rnd()*0.25;
 for(let i=0;i<30;i++){const j=s.player.jumpReady&&rnd()<pj;s.step({jump:j});if(j)s.h={t:s.tick-1,p:s.h};
  if(s.dead)break;if(s.finished){fin={tick:s.finishTick+1,h:s.h};break}
  const p=pot(s);if(p<best){best=p;bH=s.h;const d=door(s);bi=[s.tick,s.player.body.position.x|0,s.player.body.position.y|0,d.position.x|0,d.angle.toFixed(2)]}
  const k=key(s);const o=arc.get(k);if(!o||o.t>s.tick){const c=cloneSim(s);c.h=s.h;arc.set(k,{s:c,t:s.tick,p})}}
}
console.log('cells',arc.size,'best',best|0,JSON.stringify(bi),JSON.stringify(L(bH)));if(fin)console.log('FIN',fin.tick,JSON.stringify(L(fin.h)));
