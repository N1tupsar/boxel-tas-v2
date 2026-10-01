// beam scored by progress along reference trajectory (A's route)
const { Sim, loadLevel, cloneSim } = require('./boxel');
const n=24, W=+process.argv[2], T0=+(process.argv[3]||0), R=+(process.argv[4]||30), LOOK=+(process.argv[5]||12);
const L=loadLevel(n); const ref=require(process.env.REF||'../../../results/L24.json').jumps; const J=new Set(ref);
const rs=new Sim(L); const path=[];
for(let t=0;t<700&&!rs.finished;t++){const b=rs.player.body;path.push([b.position.x,b.position.y]);rs.step({jump:J.has(t)});}
const N=path.length;
const root=new Sim(L); const pre=ref.filter(t=>t<T0); const PJ=new Set(pre); while(root.tick<T0) root.step({jump:PJ.has(root.tick)});
root.prog=Math.max(0,T0-1); root.hist=null;
const adv=s=>{const b=s.player.body;let p=s.prog;for(let k=Math.min(N-1,p+60);k>p;k--){if(Math.hypot(b.position.x-path[k][0],b.position.y-path[k][1])<R){p=k;break;}}s.prog=p;};
const score=s=>{const b=s.player.body;const k=Math.min(N-1,s.prog+LOOK);return -s.prog*100+Math.hypot(b.position.x-path[k][0],b.position.y-path[k][1]);};
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/2),Math.round(b.position.y/2),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*8),s.player.jumpReady?1:0,Math.round(s.engine? 0:0)].join(',');};
let beam=[root],best=null;
for(let t=T0;t<T0+700;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);const pp=c.prog,ph=c.hist;c.step({jump:acts[k]});c.prog=pp;c.hist=acts[k]?{t,prev:ph}:ph;
   if(c.finished&&!c.dead){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}best={ticks:c.finishTick+1,jumps:[...pre,...js.reverse()]};break;}
   if(c.dead)continue;adv(c);c.score=score(c);const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}
  if(best)break;}
 if(best)break;beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);if(!beam.length)break;
 if(t%50==0)console.error(t,beam[0].prog,beam.length);}
console.log(JSON.stringify(best||{fail:true}));
