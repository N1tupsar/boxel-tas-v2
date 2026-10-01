const {Sim,loadLevel}=require('./boxel');const fs=require('fs');const L=loadLevel(24);
const out='../../../results/L24.json';let cur=JSON.parse(fs.readFileSync(out)).jumps;
function cost(j){const J=new Set(j);const s=new Sim(L);while(s.tick<cur_best+20&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished?s.finishTick+1:1e9;}
let cur_best=1e9;cur_best=cost(cur);console.log('start',cur_best);
let imp=true;
while(imp){imp=false;
 for(let i=0;i<cur.length;i++)for(let d=-3;d<=3;d++){if(!d)continue;const c=[...cur];c[i]+=d;if(c[i]<0)continue;const u=[...new Set(c)].sort((a,b)=>a-b);const v=cost(u);if(v<cur_best){cur=u;cur_best=v;imp=true;console.log('improved',v);break;}}
 for(let i=cur.length-1;i>=0;i--){const c=cur.filter((_,j)=>j!==i);const v=cost(c);if(v<=cur_best){if(v<cur_best)imp=true;cur=c;cur_best=v;console.log('removed',v);}}
}
console.log(JSON.stringify({best:cur_best,jumps:cur}));
