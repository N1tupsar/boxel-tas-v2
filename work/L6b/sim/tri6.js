const {Sim,loadLevel}=require('./boxel');const L=loadLevel(6);
function run(js,lim){const J=new Set(js);const s=new Sim(L);for(let t=0;t<lim&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:99999;}
let base=require('../../../results/L6.json').jumps;let best=run(base,300);console.log(best);const lim=()=>best+2;
const n=base.length;const R=+process.argv[2]||2;
for(let i=1;i<8;i++)for(let j=i+1;j<9;j++)for(let k=j+1;k<9;k++)for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++)for(let c=-R;c<=R;c++){const x=[...base];x[i]+=a;x[j]+=b;x[k]+=c;const u=[...new Set(x)].sort((p,q)=>p-q);const v=run(u,lim());if(v<best){best=v;base=u;console.log(v,JSON.stringify(u))}}
console.log('done',best,JSON.stringify(base));
