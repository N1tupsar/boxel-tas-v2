const {Sim,loadLevel}=require('./boxel');const fs=require('fs');const L=loadLevel(23);
let cur=JSON.parse(fs.readFileSync('best.json'))['23'];let best=1e9;
function cost(j){const J=new Set(j);const s=new Sim(L);while(s.tick<best+10&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished?s.finishTick+1:1e9;}
best=cost(cur);console.log('start',best);
const D=[-2,-1,0,1,2];
for(let i=0;i<cur.length;i++)for(let j=i+1;j<cur.length;j++)for(const a of D)for(const b of D){if(!a&&!b)continue;const c=[...cur];c[i]+=a;c[j]+=b;if(c[i]<1)continue;const u=[...new Set(c)].sort((x,y)=>x-y);const v=cost(u);if(v<best){best=v;cur=u;console.log('improved',v,JSON.stringify(u));fs.writeFileSync('pair_best23.json',JSON.stringify({best,jumps:u}));}}
console.log('done',best);
