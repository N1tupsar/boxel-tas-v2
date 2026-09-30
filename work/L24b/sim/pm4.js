const {Sim,loadLevel}=require('./boxel');const L=loadLevel(24);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<270&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[101,180,204,222,240,250];let best=run(base);console.log(best);
for(const t of [0,1,2,3]){const v=run([t,...base]);console.log('extra',t,v)}
for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best);
