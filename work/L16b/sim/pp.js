const {Sim,loadLevel}=require('./boxel');const L=loadLevel(16);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<260&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[0,10,15,18,21,22,26,31,33,35,37,39,41,44,47,50,53,55,57,58,61,64,66,70,73,76,78,79,85,92,110,119,120,125,152,174,176,186];let best=run(base);console.log(best);
for(let i=0;i<base.length;i++)for(let j=i+1;j<Math.min(base.length,i+4);j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;if(c[i]<0||c[j]<0)continue;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best);
