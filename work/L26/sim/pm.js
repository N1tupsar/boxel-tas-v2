const {Sim,loadLevel}=require('./boxel');const L=loadLevel(26);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<840&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
let base=require('./cand.json').jumps;let best=run(base);console.log(best);
for(let pass=0;pass<2;pass++)for(let i=0;i<base.length;i++)for(let a=-3;a<=3;a++){if(!a)continue;const c=[...base];c[i]+=a;if(c[i]<0)continue;const v=run(c);if(v<best){best=v;base=c;console.log(v,JSON.stringify(c))}}
console.log('done',best,JSON.stringify(base));
