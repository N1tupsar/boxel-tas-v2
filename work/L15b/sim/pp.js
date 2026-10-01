const {Sim,loadLevel}=require('./boxel');const L=loadLevel(15);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<400&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[79,96,155,220,248,252,270,275,280,301,328,334,335,341,344,372,375,379,380];let best=run(base);console.log(best);
for(let i=0;i<base.length;i++)for(let j=i+1;j<Math.min(base.length,i+5);j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best);
