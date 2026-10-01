const {Sim,loadLevel}=require('./boxel');const L=loadLevel(3);const R=+process.argv[2];
function run(js,lim){const J=new Set(js);const s=new Sim(L);for(let t=0;t<lim&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:99999;}
let base=require('../../../results/L3.json').jumps;let best=run(base,340);console.log(best);
for(let i=0;i<base.length;i++)for(let j=i+1;j<base.length;j++)for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){const x=[...base];x[i]+=a;x[j]+=b;if(x[i]<0||x[j]<0)continue;const u=[...new Set(x)].sort((p,q)=>p-q);const v=run(u,best+3);if(v<best){best=v;base=u;console.log(v,JSON.stringify(u))}}
console.log('done',best,JSON.stringify(base));
