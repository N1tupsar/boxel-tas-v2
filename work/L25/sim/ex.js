const {Sim,loadLevel,cloneSim}=require('./boxel');const L=loadLevel(25);
const root=new Sim(L);root.hist=null;let cur=[root];let best=null;
const key=s=>{const b=s.player.body;return [b.position.x.toFixed(1),b.position.y.toFixed(1),b.velocity.x.toFixed(2),b.velocity.y.toFixed(2),b.angle.toFixed(2),s.player.jumpReady?1:0,s.engine.gravity.x,s.engine.gravity.y].join()};
for(let t=0;t<130&&!best;t++){const kids=new Map();
 for(const s of cur){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;
   if(c.finished){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={ticks:c.finishTick+1,jumps:js.reverse()};break}
   if(c.dead)continue;const kk=key(c);if(!kids.has(kk))kids.set(kk,c);}
  if(best)break}
 cur=[...kids.values()];if(t%20==0)console.log(t,cur.length);if(cur.length>60000){cur=cur.sort(()=>Math.random()-.5).slice(0,60000)}}
console.log(JSON.stringify(best));
