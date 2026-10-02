const { Sim, loadLevel, cloneSim } = require('./boxel');
const H=+process.argv[2],W=+process.argv[3];const PRE=JSON.parse(process.env.PRE),T0=+process.env.T0;
const root=new Sim(loadLevel(23));const J=new Set(PRE);while(root.tick<T0)root.step({jump:J.has(root.tick)});root.hist=null;for(const t of PRE)if(t<T0)root.hist={t,prev:root.hist};
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};let beam=[root];
let _sd=+(process.env.SEED||1);const rnd=()=>{_sd=(_sd*1664525+1013904223)>>>0;return _sd/4294967296};const VXT=+(process.env.VXT||-3.4),NZ=+(process.env.NOISE||0);let best=+process.env.BEST||999,bestJ=null;const seen=new Set();
function endgame(s,t){ // s at start of tick t (not yet stepped); try one jump at a in [t,t+80)
  let res=null;
  for(let a=t;a<t+80;a++){ if(a>=best)break; const c=cloneSim(s);let ok=true;
    while(c.tick<best&&!c.finished&&!c.dead){c.step({jump:c.tick===a});}
    if(c.finished&&c.finishTick+1<best){best=c.finishTick+1;res=[a,best];bestJ=[...hl(s.hist),a].sort((x,y)=>x-y);console.log('FOUND',best,JSON.stringify(bestJ));}
  }
}
for(let t=T0;t<H;t++){const kids=new Map();let evals=0;
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
   const b=c.player.body,x=b.position.x,y=-b.position.y,vx=b.velocity.x;
   c.score=Math.max(0,x+95)+Math.abs(Math.min(0,vx-VXT))*30+Math.max(0,455-y)+NZ*rnd();
   if(x<=-90&&x>=-125&&y>=455&&c.player.jumpReady&&b.velocity.y>=0.3&&vx<=-2.5&&evals<60&&t+1<best-20){const key=[x,y,vx*8,b.velocity.y*8].map(Math.round).join();if(!seen.has(key)){seen.add(key);evals++;endgame(c,t+1)}}
   const kk=[x,y,vx*4,b.velocity.y*4,b.angle*8].map(Math.round).join(',')+(c.player.jumpReady?1:0);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
 if(t%20==0)console.log('t',t,'best',best);}
console.log('END',best,JSON.stringify(bestJ));
