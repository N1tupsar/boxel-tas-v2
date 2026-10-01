const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||1500;
const L=loadLevel(28);const root=new Sim(L);root.hist=null;let beam=[root];const tx=-232,ty=-8;
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*5),s.player.jumpReady?1:0].join(',')};
for(let t=0;t<120;t++){const kids=new Map();let hit=null;
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead||c.finished)continue;
   if(c.engine.gravity.x===-1&&!hit){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}const b=c.player.body;hit={tick:c.tick,pos:[Math.round(b.position.x),Math.round(b.position.y)],v:[+b.velocity.x.toFixed(1),+b.velocity.y.toFixed(1)],jumps:js.reverse()};}
   const b=c.player.body;c.score=Math.hypot(b.position.x-tx,b.position.y-ty);const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 if(hit){console.log(JSON.stringify(hit));break}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
