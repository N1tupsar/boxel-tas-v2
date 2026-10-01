const {Sim,loadLevel}=require('./boxel');const L=loadLevel(19);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<260&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
let base=[0,6,14,15,23,29,37,47,54,60,70,73,74,85,86,87,91,93,96,99,102,108,109,131,133,136];let best=run(base);console.log(best);
for(let pass=0;pass<2;pass++)for(let i=0;i<base.length;i++)for(let a=-3;a<=3;a++){if(!a)continue;const c=[...base];c[i]+=a;if(c[i]<0)continue;const v=run(c);if(v<best){best=v;base=c;console.log(v,JSON.stringify(c))}}
for(let i=0;i<base.length;i++)for(let j=i+1;j<Math.min(base.length,i+3);j++)for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const c=[...base];c[i]+=a;c[j]+=b;if(c[i]<0||c[j]<0)continue;const v=run(c);if(v<best){best=v;console.log(v,JSON.stringify(c))}}
console.log('done',best,JSON.stringify(base));
