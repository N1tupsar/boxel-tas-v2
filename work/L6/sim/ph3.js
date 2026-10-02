const { Sim, loadLevel } = require('./boxel'); const { mkFast } = require('./fast');
const W=+process.argv[2]||3000, C=+(process.argv[3]||10);
const S=new Sim(loadLevel(6)),F=mkFast(S),P=S.player,b=P.body;
function hl(h){const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()}
let beam=[{snap:F.save(),hist:null,score:0}];
for(let t=0;t<100;t++){
  const kids=new Map();
  for(const st of beam){F.load(st.snap);const canJ=t>=1&&P.jumpReady;
    for(let k=0;k<(canJ?2:1);k++){ if(k)F.load(st.snap); const j=canJ&&k===1; S.step({jump:j}); if(S.dead)continue;
      const sc=-(b.position.x+C*b.velocity.x);
      const key=[Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x),Math.round(b.velocity.y),P.jumpReady?1:0,Math.round((((b.angle%(Math.PI/2))+Math.PI/2)%(Math.PI/2))*6),Math.round(b.angularVelocity*20)].join();
      const pr=kids.get(key); if(!pr||pr.score>sc)kids.set(key,{score:sc,snap:F.save(),hist:j?{t,prev:st.hist}:st.hist});}}
  beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
  if(t%10==9){F.load(beam[0].snap);console.log(t+1,'x',b.position.x.toFixed(0),'y',(-b.position.y).toFixed(0),'vx',b.velocity.x.toFixed(2),'vy',(-b.velocity.y).toFixed(2),JSON.stringify(hl(beam[0].hist)));}
}
