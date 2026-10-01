const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||1500,H=+process.argv[3]||100;
const L=loadLevel(22);const root=new Sim(L);root.hist=null;root.turn=false;let beam=[root],best={est:1e9};
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*5),s.player.jumpReady?1:0,s.turn?1:0].join(',')};
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);const tn=s.turn;c.step({jump:acts[k]});c.turn=tn;c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead||c.finished)continue;
   const b=c.player.body;if(b.position.y>20&&b.position.x>200&&b.position.x<250)c.turn=true;
   let sc;
   if(c.turn){const est=c.tick+(b.position.x+56)/Math.max(-b.velocity.x,0.3)+(b.velocity.x<0?0:50);sc=est-1000;
     if(b.velocity.x<0&&b.position.x<238&&est<best.est){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={est,vx:b.velocity.x,t:c.tick,x:b.position.x,jumps:js.reverse()}}}
   else sc=Math.hypot(b.position.x-232,b.position.y-35);
   c.score=sc;const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
console.log(JSON.stringify(best));
