const {Sim,loadLevel}=require('./boxel');const n=+process.argv[2];const L=loadLevel(n);const fs=require('fs');const out=`../../../results/L${n}.json`;
let cur=JSON.parse(fs.readFileSync(out)).jumps;const N=+process.argv[3]||400;
function cost(j,lim){const J=new Set(j);const s=new Sim(L);while(s.tick<lim&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished&&!s.dead?s.finishTick+1:1e9}
let best=cost(cur,2000);console.log('start',best);let seed=12345;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let it=0;it<N;it++){const c=[...cur];const m=1+Math.floor(rnd()*3);
 for(let k=0;k<m;k++){const r=rnd();if(r<0.6){const i=Math.floor(rnd()*c.length);c[i]=Math.max(0,c[i]+Math.round((rnd()-0.5)*8))}else if(r<0.8){const i=Math.floor(rnd()*c.length);c.splice(i,1)}else{c.push(Math.floor(rnd()*best))}}
 const u=[...new Set(c)].sort((a,b)=>a-b);const v=cost(u,best+5);if(v<=best){if(v<best)console.log('improved',v,JSON.stringify(u));best=v;cur=u}}
console.log(JSON.stringify({best,jumps:cur}));
