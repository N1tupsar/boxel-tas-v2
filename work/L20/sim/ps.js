const {Sim,loadLevel}=require('./boxel');const L=loadLevel(20);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<560&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
let base=[47,64,67,72,74,142,185,193,199,200,205,208,222,247,252,255,258,264,266,268,295,337,341,383,414,464,472];let best=run(base);console.log(best);
for(let pass=0;pass<2;pass++)for(let i=0;i<base.length;i++)for(let a=-3;a<=3;a++){if(!a)continue;const c=[...base];c[i]+=a;if(c[i]<0)continue;const v=run(c);if(v<best){best=v;base=c;console.log(v,JSON.stringify(c))}}
for(let t=0;t<4;t++)console.log('extra',t,run([t,...base]));
console.log('done',best);
