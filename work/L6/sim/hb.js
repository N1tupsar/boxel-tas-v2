const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||300, MAXT=+process.argv[3]||350, ALPHA=+(process.env.ALPHA||0);
const BETA=+(process.env.BETA||0),NOISE=+(process.env.NOISE||0);let sd=+(process.env.SEED||1);const rnd=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
const g=0.001*(1000/60)**2;
const lv=loadLevel(6);const root=new Sim(lv);root.hist=null;
function hl(h){const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()}
let beam=[root];
function H(s){const b=s.player.body;const v2=b.velocity.x**2+b.velocity.y**2;return -b.position.y+v2/(2*g)}
for(let t=0;t<MAXT;t++){
  const kids=new Map();
  for(const s of beam){
    const P=s.player;const canJ=t>=1&&P.mode==='jump'&&P.jumpReady;
    for(const j of canJ?[true,false]:[false]){
      const c=(j===false)?(canJ?cloneSim(s):s):cloneSim(s);
      c.step({jump:j});c.hist=j?{t,prev:s.hist}:s.hist;
      if(c.dead)continue;
      if(c.finished){console.log('FINISH',c.finishTick+1,JSON.stringify(hl(c.hist)));process.exit()}
      const b=c.player.body;
      c.score=-(H(c)) + ALPHA*b.position.x + BETA*b.velocity.x + (NOISE?NOISE*(rnd()-0.5):0);
      const key=[Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x),Math.round(b.velocity.y),c.player.jumpReady?1:0].join();
      const pr=kids.get(key);if(!pr||pr.score>c.score)kids.set(key,c);
    }
  }
  beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
  if(t%25==0){const b=beam[0].player.body;if(process.env.LOG)console.log(t,'H',(-beam[0].score).toFixed(0),'x',b.position.x.toFixed(0),'y',(-b.position.y).toFixed(0),'vx',b.velocity.x.toFixed(1));}
  // check leftward goal
  if(0)for(const s of beam){const b=s.player.body;if(b.position.x<135&&b.velocity.x<-3&&-b.position.y>-80&&t>60){console.log('LEFT',t,b.position.x,-b.position.y,b.velocity.x,JSON.stringify(hl(s.hist)));}}
}
