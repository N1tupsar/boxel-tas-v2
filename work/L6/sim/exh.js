const { Sim, loadLevel } = require('./boxel'); const { mkFast } = require('./fast');
const PRE=JSON.parse(process.argv[2]), T0=+process.argv[3], T1=+process.argv[4], CAP=+(process.argv[5]||2e6);
const S=new Sim(loadLevel(6)),F=mkFast(S),P=S.player,b=P.body;
const J=new Set(PRE); for(let t=0;t<T0;t++)S.step({jump:J.has(t)});
let beam=[{snap:F.save(),hist:null}];
function hl(h){const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()}
for(let t=T0;t<T1;t++){
  const kids=new Map();
  for(const st of beam){F.load(st.snap);const canJ=P.jumpReady;
    for(let k=0;k<(canJ?2:1);k++){ if(k)F.load(st.snap); const j=canJ&&k===1; S.step({jump:j}); if(S.dead)continue;
      const key=[b.position.x.toFixed(3),b.position.y.toFixed(3),b.velocity.x.toFixed(3),b.velocity.y.toFixed(3),b.angle.toFixed(3),b.angularVelocity.toFixed(4),P.jumpReady?1:0].join();
      if(!kids.has(key))kids.set(key,{snap:F.save(),hist:j?{t,prev:st.hist}:st.hist,ex:0});}}
  beam=[...kids.values()];
  console.log(t+1,beam.length);
  if(beam.length>CAP){console.log('cap');break}
}
// evaluate
let best=1e9,bj=null;
for(const st of beam){F.load(st.snap);if(b.velocity.x>-5)continue;const est=(T1)+(b.position.x+73)/(-b.velocity.x);if(est<best){best=est;bj=hl(st.hist);console.log('est',est.toFixed(1),'x',b.position.x.toFixed(1),'vx',b.velocity.x.toFixed(2),'y',(-b.position.y).toFixed(0),JSON.stringify(PRE.concat(bj)));}}
