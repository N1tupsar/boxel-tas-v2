const { Sim, loadLevel, cloneSim } = require('./boxel');
const T0=+process.argv[2], W=+process.argv[3]||2000, H=+process.argv[4]||60;
const full=require('../../../results/L22.json').jumps;const pre=full.filter(t=>t<T0);const J=new Set(pre);
const L=loadLevel(22);const root=new Sim(L);while(root.tick<T0)root.step({jump:J.has(root.tick)});root.hist=null;
let beam=[root],best={vx:0};
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*5),s.player.jumpReady?1:0].join(',')};
for(let t=T0;t<T0+H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead||c.finished)continue;
   const b=c.player.body;const vx=b.velocity.x;
   // only count states left of pillar zone and settled (|vy|<3)
   if(b.position.x<225&&vx<best.vx){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={vx,t:c.tick,x:b.position.x,y:b.position.y,vy:b.velocity.y,jumps:[...pre,...js.reverse()]}}
   c.score=b.velocity.x*5+(b.position.x>240?(b.position.x-240):0);const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
console.log(JSON.stringify(best));
