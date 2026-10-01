const { Sim, loadLevel, cloneSim } = require('./boxel');
const n=+process.argv[2], W=+(process.argv[3]||300), T=+(process.argv[4]||400);
const L=loadLevel(n); const root=new Sim(L); root.hist=null; let beam=[root]; let best={v:0};
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/12),Math.round(b.position.y/12),Math.round(b.velocity.x/2),Math.round(b.velocity.y/2),s.player.jumpReady?1:0].join(',')};
const t0=Date.now();
for(let t=0;t<T;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;
   if(c.dead||c.finished)continue;const b=c.player.body;const v=Math.hypot(b.velocity.x,b.velocity.y);
   if(v>best.v){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={v,t:c.tick,pos:[Math.round(b.position.x),Math.round(b.position.y)],vel:[+b.velocity.x.toFixed(1),+b.velocity.y.toFixed(1)],jumps:js.reverse()}}
   c.score=-v;const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);if(!beam.length)break;
 if(Date.now()-t0>(+process.env.MS||60000))break;}
console.log(JSON.stringify({n,vmax:+best.v.toFixed(1),t:best.t,pos:best.pos,vel:best.vel,jumps:best.jumps}));
