const {Sim,loadLevel}=require('./boxel');const L=loadLevel(4);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<300&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[43,109,153,207,252];let best=run(base);console.log(best);
for(const t of [0,1,2,3])console.log('extra',t,run([t,...base]));
for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best);
