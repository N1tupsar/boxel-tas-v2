const {Sim,loadLevel}=require('./boxel');const L=loadLevel(22);const fs=require('fs');
let seed=+process.argv[2]||1;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const N=+process.argv[3]||3000;
let early=[0,11,14,16,18,21,26,28];
// cost: run early jumps; then try final jump at each tick in [90,130] (and none); return min finish
function run(J,lim){const s=new Sim(L);while(s.tick<lim&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished&&!s.dead?s.finishTick+1:1e9}
function cost(e,best){const base=new Set(e);let b=1e9,bt=-1;
 // quick prune: run once with no final jump to find state; try final jumps
 for(let t=88;t<=128;t++){const J=new Set(e);J.add(t);const v=run(J,Math.min(best+3,200));if(v<b){b=v;bt=t}}
 return [b,bt]}
let [best,bt]=cost(early,2000);console.log('start',best,bt);let cur=early;
for(let it=0;it<N;it++){const c=[...cur];const m=1+Math.floor(rnd()*3);
 for(let k=0;k<m;k++){const r=rnd();if(r<0.7){const i=Math.floor(rnd()*c.length);c[i]=Math.max(0,c[i]+Math.round((rnd()-0.5)*6))}else if(r<0.85){const i=Math.floor(rnd()*c.length);c.splice(i,1)}else{c.push(Math.floor(rnd()*60))}}
 const u=[...new Set(c)].sort((a,b)=>a-b);const [v,t]=cost(u,best);if(v<=best){if(v<best)console.log('improved',v,t,JSON.stringify(u));best=v;cur=u;bt=t}}
console.log(JSON.stringify({best,final:bt,early:cur}));
