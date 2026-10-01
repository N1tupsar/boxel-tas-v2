const {Sim,loadLevel}=require('./boxel');const L=loadLevel(11);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<260&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[0,10,12,15,17,21,23,25,27,29,32,35,37,41,46,49,51,58,67,70,72,74,76,78,81,83,86,88,91,94,98,101,103,105,110,116,123,132,135,137,139,141,145,147,149,152,154,157,160,164,167,170,172,173];let best=run(base);console.log(best);
for(let i=0;i<base.length;i++)for(let j=i+1;j<Math.min(base.length,i+3);j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;if(c[i]<0||c[j]<0)continue;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best);
