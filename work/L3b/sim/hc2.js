const {Sim,loadLevel}=require('./boxel');const n=3;const L=loadLevel(n);const fs=require('fs');
let cur=[4,17,20,24,28,29,61,115,119,180,238,245];const N=+process.argv[2]||1500;
function cost(j,lim){const J=new Set(j);const s=new Sim(L);while(s.tick<lim&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});if(s.finished&&!s.dead)return s.finishTick+1;return 2000+(lim-s.tick)*(s.dead?1:0)+(s.dead?0:500)}
let best=cost(cur,420);console.log('start',best);let seed=777;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let it=0;it<N;it++){const c=[...cur];const m=1+Math.floor(rnd()*3);
 for(let k=0;k<m;k++){const r=rnd();if(r<0.65){const i=Math.floor(rnd()*c.length);c[i]=Math.max(0,c[i]+Math.round((rnd()-0.5)*6))}else if(r<0.8){const i=Math.floor(rnd()*c.length);c.splice(i,1)}else{c.push(Math.floor(rnd()*330))}}
 const u=[...new Set(c)].sort((a,b)=>a-b);const v=cost(u,best<2000?best+5:420);if(v<=best){if(v<best)console.log('improved',v,JSON.stringify(u));best=v;cur=u}}
console.log(JSON.stringify({best,jumps:cur}));
