const {Sim,loadLevel}=require('./boxel');const N=+process.argv[2],seed=+process.argv[3],MS=+process.argv[4],MAXT=+process.argv[5];const L=loadLevel(N);
let a=seed;const rnd=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296};
function run(js,lim){const J=new Set(js);const s=new Sim(L);for(let t=0;t<lim&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:99999-s.tick;}
let base=process.env.J?JSON.parse(process.env.J):[...require('../../../results/L'+N+'.json').jumps];let best=run(base,MAXT);const t0=Date.now();let it=0;
while(Date.now()-t0<MS){it++;const c=[...base];const k=1+Math.floor(rnd()*3);
 for(let m=0;m<k;m++){const r=rnd();const i=Math.floor(rnd()*c.length);
  if(r<0.6)c[i]+=Math.floor(rnd()*9)-4;else if(r<0.75&&c.length>2)c.splice(i,1);else if(r<0.9)c.splice(i,0,c[i]+Math.floor(rnd()*7)-3);else{c[i]+=Math.floor(rnd()*21)-10}}
 const u=[...new Set(c.filter(x=>x>=0))].sort((x,y)=>x-y);const v=run(u,best+3);
 if(v<=best){if(v<best)console.log(it,v,JSON.stringify(u));best=v;base=u}}
console.log('final',best,it,JSON.stringify(base));
