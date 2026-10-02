const { Sim, loadLevel } = require('./boxel'); const { mkFast } = require('./fast');
const W=+process.argv[2]||3000, MAXT=+process.argv[3]||260;
const S=new Sim(loadLevel(6)),F=mkFast(S),P=S.player,b=P.body;
function hl(h){const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()}
let beam=[{snap:F.save(),hist:null,score:0}];
let bestEver=1e9;
for(let t=0;t<MAXT;t++){
  const kids=new Map();
  for(const st of beam){F.load(st.snap);const canJ=t>=1&&P.jumpReady;
    for(let k=0;k<(canJ?2:1);k++){ if(k)F.load(st.snap); const j=canJ&&k===1; S.step({jump:j}); if(S.dead)continue;
      const x=b.position.x,y=-b.position.y;
      // phase score: want to be under the bowl: y<-215 and x small
      let sc;
      if(y<-215){ sc = x + 5*b.velocity.x - 1000; if(x<bestEver){bestEver=x; console.log('under bowl x',x.toFixed(0),'y',y.toFixed(0),'vx',b.velocity.x.toFixed(1),'t',t,JSON.stringify(hl(j?{t,prev:st.hist}:st.hist)));} }
      else sc = Math.hypot(x-490, y+215)*1 ; // go to the gap
      const key=[Math.round(x/3),Math.round(y/3),Math.round(b.velocity.x),Math.round(b.velocity.y),P.jumpReady?1:0].join();
      const pr=kids.get(key); if(!pr||pr.score>sc)kids.set(key,{score:sc,snap:F.save(),hist:j?{t,prev:st.hist}:st.hist});}}
  beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
}
