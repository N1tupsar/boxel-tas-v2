const { Sim, loadLevel, cloneSim } = require('./boxel');
const L=+process.env.L, H=+process.argv[2]||120, W=+process.argv[3]||1500, TX=+process.argv[4], TY=+process.argv[5];
const root=new Sim(loadLevel(L));root.hist=null;let beam=[root];const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
let bestd=1e9;
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=(t>=1&&s.player.jumpReady)?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
   if(c.finished){console.log('FIN',c.finishTick+1,JSON.stringify(hl(c.hist)));process.exit()}
   const b=c.player.body;c.score=Math.hypot(b.position.x-TX,-b.position.y-TY);
   const kk=[b.position.x,b.position.y,b.velocity.x*4,b.velocity.y*4,b.angle*10].map(Math.round).join(',')+(c.player.jumpReady?1:0);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);bestd=Math.min(bestd,beam[0].score);}
console.log('best dist',bestd.toFixed(1));
