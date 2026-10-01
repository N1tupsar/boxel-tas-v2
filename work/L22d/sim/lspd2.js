const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||1500,H=+process.argv[3]||90;
const L=loadLevel(22);const root=new Sim(L);root.hist=null;root.turn=false;let beam=[root],best={vx:0};
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*5),s.player.jumpReady?1:0,s.turn?1:0].join(',')};
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);const tn=s.turn;c.step({jump:acts[k]});c.turn=tn;c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead||c.finished)continue;
   const b=c.player.body;if(b.position.x>205)c.turn=true;
   if(c.turn&&b.position.x<225&&b.velocity.x<best.vx){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={vx:b.velocity.x,t:c.tick,x:b.position.x,y:b.position.y,vy:b.velocity.y,jumps:js.reverse()}}
   c.score=c.turn?b.velocity.x*10-1000:-b.position.x;const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
console.log(JSON.stringify(best));
