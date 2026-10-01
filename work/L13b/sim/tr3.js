const {Sim,loadLevel}=require('./boxel');const N=+process.argv[2],MAXT=+process.argv[3];const L=loadLevel(N);
function run(js,lim){const J=new Set(js);const s=new Sim(L);for(let t=0;t<lim&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished&&!s.dead?s.finishTick+1:99999;}
let base=require('../../../results/L'+N+'.json').jumps;let best=run(base,MAXT);console.log('start',best);
for(let i=0;i+2<base.length;i++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)for(let c=-3;c<=3;c++){const x=[...base];x[i]+=a;x[i+1]+=b;x[i+2]+=c;const u=[...new Set(x.filter(v=>v>=0))].sort((p,q)=>p-q);const v=run(u,best+2);if(v<best){best=v;base=u;console.log(v,JSON.stringify(u))}}
console.log('done',best);
