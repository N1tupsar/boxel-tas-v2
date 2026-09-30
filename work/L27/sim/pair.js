const {Sim,loadLevel}=require('./boxel');const L=loadLevel(27);const cur=require('../../../results/L27.json').jumps;
function cost(j){const J=new Set(j);const s=new Sim(L);while(s.tick<140&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished?s.finishTick+1:1e9}
let best=cost(cur);console.log('base',best);
for(let i=0;i<cur.length;i++)for(let k=i+1;k<cur.length;k++)for(let a=-4;a<=4;a++)for(let b=-4;b<=4;b++){const c=[...cur];c[i]+=a;c[k]+=b;if(c[i]<0)continue;const u=[...new Set(c)];const v=cost(u);if(v<best){best=v;console.log(v,JSON.stringify(u.sort((x,y)=>x-y)))}}
