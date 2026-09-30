const {Sim,loadLevel}=require('./boxel');const L=loadLevel(25);const cur=require('../../../results/L25.json').jumps;
function cost(j){const J=new Set(j);const s=new Sim(L);while(s.tick<60&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished?s.finishTick+1:1e9}
let best=cost(cur);console.log('base',best);
for(let i=0;i<cur.length;i++)for(let k=i+1;k<cur.length;k++)for(let a=-4;a<=4;a++)for(let b=-4;b<=4;b++){const c=[...cur];c[i]+=a;c[k]+=b;if(c[i]<0||c[k]<0)continue;const v=cost([...new Set(c)]);if(v<best){best=v;console.log(v,c)}}
