const {Sim,loadLevel}=require('./boxel');const n=+process.argv[2];const L=loadLevel(n);const fs=require('fs');const out=`../../../results/L${n}.json`;
let cur=JSON.parse(fs.readFileSync(out)).jumps;const R=+process.argv[3]||3;
function cost(j,lim){const J=new Set(j);const s=new Sim(L);while(s.tick<lim&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished&&!s.dead?s.finishTick+1:1e9}
let best=cost(cur,2000);console.log('base',best);let imp=true;
while(imp){imp=false;
for(let i=0;i<cur.length;i++)for(let k=i+1;k<cur.length;k++)for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){if(!a&&!b)continue;const c=[...cur];c[i]+=a;c[k]+=b;if(c[i]<0||c[k]<0)continue;const u=[...new Set(c)].sort((x,y)=>x-y);const v=cost(u,best);if(v<best){best=v;cur=u;imp=true;console.log(v,JSON.stringify(u))}}
// also try dropping each jump / adding one
for(let i=0;i<cur.length;i++){const u=cur.filter((_,j)=>j!==i);const v=cost(u,best);if(v<=best){if(v<best)imp=true;best=v;cur=u;console.log('drop',v)}}
for(let t=0;t<best&&!imp;t++){if(cur.includes(t))continue;const u=[...cur,t].sort((x,y)=>x-y);const v=cost(u,best);if(v<best){best=v;cur=u;imp=true;console.log('add',v,JSON.stringify(u))}}
}
console.log(JSON.stringify({best,jumps:cur}));
