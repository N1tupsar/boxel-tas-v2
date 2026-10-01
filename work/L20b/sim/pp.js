const {Sim,loadLevel}=require('./boxel');const L=loadLevel(20);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<560&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[47,64,67,72,74,142,185,193,199,200,205,208,222,247,252,255,258,264,266,268,295,337,341,383,414,464,472];let best=run(base);console.log(best);
for(let i=0;i<base.length;i++)for(let j=i+1;j<Math.min(base.length,i+4);j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;if(c[i]<0||c[j]<0)continue;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best);
