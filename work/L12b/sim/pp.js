const {Sim,loadLevel}=require('./boxel');const L=loadLevel(12);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<270&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[4,91,97,101,120,127,130,152,173,183,188];let best=run(base);console.log(best);
for(let i=0;i<base.length;i++)for(let j=i+1;j<base.length;j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;if(c[i]<0||c[j]<0)continue;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
for(let t=0;t<4;t++)console.log('extra',t,run([t,...base]));console.log('done',best);
