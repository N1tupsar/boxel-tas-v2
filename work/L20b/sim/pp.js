const {Sim,loadLevel}=require('./boxel');const L=loadLevel(20);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<460&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
let base=[47,65,68,73,76,100,112,114,117,119,122,125,127,129,131,133,152,162,252,295,326,366,408];let best=run(base);console.log(best);
for(let pass=0;pass<3;pass++)for(let i=0;i<base.length;i++)for(let a=-4;a<=4;a++){if(!a)continue;const c=[...base];c[i]+=a;if(c[i]<0)continue;const v=run(c);if(v<best){best=v;base=c;console.log(v,JSON.stringify(c))}}
for(let i=0;i<base.length;i++)for(let j=i+1;j<Math.min(base.length,i+4);j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;if(c[i]<0||c[j]<0)continue;const v=run(c);if(v<best){best=v;base=c;console.log(v,JSON.stringify(c))}}
console.log('done',best,JSON.stringify(base));
