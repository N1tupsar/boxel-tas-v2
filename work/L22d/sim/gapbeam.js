const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||3000,H=+process.argv[3]||110,tx=+process.argv[4]||370,ty=+process.argv[5]||110;
const L=loadLevel(24);const root=new Sim(L);root.hist=null;let beam=[root],best={d:1e9};
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*5),s.player.jumpReady?1:0].join(',')};
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead||c.finished)continue;
   const b=c.player.body;const d=Math.hypot(b.position.x-tx,b.position.y-ty);
   if(d<best.d){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={d,t:c.tick,pos:[Math.round(b.position.x),Math.round(b.position.y)],v:[+b.velocity.x.toFixed(1),+b.velocity.y.toFixed(1)],jumps:js.reverse()}}
   c.score=d;const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
console.log(JSON.stringify(best));
