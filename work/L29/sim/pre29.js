const { Sim, loadLevel, cloneSim } = require('./boxel');
const H=+process.argv[2]||60, W=+process.argv[3]||1000, K=+process.argv[4]||300;
const root=new Sim(loadLevel(29)); root.hist=null;
let beam=[root];const PRE=process.env.PRE?JSON.parse(process.env.PRE):[];const T0=+process.env.T0||0;if(T0){const J=new Set(PRE);while(root.tick<T0)root.step({jump:J.has(root.tick)});root.hist=null;for(const t of PRE)if(t<T0)root.hist={t,prev:root.hist};beam=[root]}
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
const key=s=>{const b=s.player.body;return [b.position.x,b.position.y,b.velocity.x*4,b.velocity.y*4,b.angle*10,b.angularVelocity*50].map(Math.round).join(',')+(s.player.jumpReady?1:0)};
for(let t=T0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=(t>=1&&s.player.jumpReady)?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;if(c.finished){console.log("FIN",c.finishTick+1,JSON.stringify(hl(c.hist)));process.exit()}
   const b=c.player.body;c.score=process.env.OBJ==="y"?b.position.y:-b.position.x;
   const kk=key(c),p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 const all=[...kids.values()].sort((a,b)=>a.score-b.score);if(process.env.GROUP){const TH=[136,424,688,936,1184,1440];const cnt={};beam=[];for(const s of all){const x=s.player.body.position.x;let g=0;while(g<6&&x>TH[g]+12)g++;cnt[g]=(cnt[g]||0)+1;if(cnt[g]<=W)beam.push(s)}}else if(process.env.BINS){const bw=+process.env.BINS;const cnt={};beam=[];const arr=all.slice().sort((p,q)=>q.player.body.velocity.x-p.player.body.velocity.x);for(const s of arr){const c=Math.floor(s.player.body.position.x/bw);cnt[c]=(cnt[c]||0)+1;if(cnt[c]<=W)beam.push(s)}}else if(process.env.POOLS){const Ks=process.env.POOLS.split(',').map(Number);const set=new Set();for(const KK of Ks){const f=s=>{const b=s.player.body;return -(b.position.x+Math.max(b.velocity.x,0)*(KK-t))};const arr=all.slice().sort((p,q)=>f(p)-f(q));for(let i=0;i<Math.min(W,arr.length);i++)set.add(arr[i])}beam=[...set]}else beam=all.slice(0,W);}
for(const s of beam.slice(0,5)){const b=s.player.body;console.log(b.position.x.toFixed(1),(-b.position.y).toFixed(1),b.velocity.x.toFixed(3),b.velocity.y.toFixed(2),JSON.stringify(hl(s.hist)))}
