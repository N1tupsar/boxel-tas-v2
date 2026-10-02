// exhaustive chain phase then mini-beams. node exh2.js PRE T0 T1 K W [CAPN]
const { Sim, loadLevel } = require('./boxel'); const { mkFast } = require('./fast');
const PRE=JSON.parse(process.argv[2]), T0=+process.argv[3], T1=+process.argv[4], K=+process.argv[5], WB=+process.argv[6], CAP=+(process.argv[7]||4e6);
const KA=+(process.env.KA||6), KQ=+(process.env.KQ||2), TWm=+(process.env.TW||5), CMIN=+(process.env.CMIN||6), G=+(process.env.GAMMA||0.3), YC=+(process.env.YC||0);
const g=0.001*(1000/60)**2;
const S=new Sim(loadLevel(6)),F=mkFast(S),P=S.player,b=P.body;
const J=new Set(PRE); for(let t=0;t<T0;t++)S.step({jump:J.has(t)});
let beam=[{snap:F.save(),hist:null}];
function hl(h){const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()}
for(let t=T0;t<T1;t++){
  const kids=new Map();
  for(const st of beam){F.load(st.snap);const canJ=P.jumpReady;
    for(let k=0;k<(canJ?2:1);k++){ if(k)F.load(st.snap); const j=canJ&&k===1; S.step({jump:j}); if(S.dead)continue;
      const key=[b.position.x.toFixed(3),b.position.y.toFixed(3),b.velocity.x.toFixed(3),b.velocity.y.toFixed(3),b.angle.toFixed(3),b.angularVelocity.toFixed(4),P.jumpReady?1:0].join();
      if(!kids.has(key))kids.set(key,{snap:F.save(),hist:j?{t,prev:st.hist}:st.hist});}}
  beam=[...kids.values()];
  if(beam.length>CAP){console.log('cap at',t);break}
}
console.log('states',beam.length);
const cand=[];
const gg=g;
function ana(x,y,vx,vy,ready){ // returns flight time T or Infinity; coordinates game y up
  if(vx>-5)return Infinity; const T=(x+72)/(-vx); let bestT=Infinity;
  const taus=ready?[...Array(Math.ceil(T)+1).keys()].concat([-1]):[-1];
  for(const tau of taus){
    const yAt=(tt)=>{ if(tau<0||tt<=tau) return y+vy*tt-gg*tt*tt/2; const y1=y+vy*tau-gg*tau*tau/2; const d=tt-tau; return y1+6.667*d-gg*d*d/2; };
    let ok=true;
    for(let xs=Math.min(x,640);xs>=-72&&ok;xs-=8){ const tt=(x-xs)/(-vx); const yy=yAt(tt);
      let need=-1e9;
      if(xs>=500&&xs<=640)need=-114; else if(xs>=432&&xs<=500)need=-112; else if(xs>=-45&&xs<=20)need=-44; else if(xs>20&&xs<=140)need=-75; else if(xs>140&&xs<=232)need=-140;
      if(yy<need)ok=false; }
    const yf=yAt(T); if(yf>-24||yf<-56)ok=false;
    if(ok){bestT=T;break;}
  }
  return bestT;
}
for(const st of beam){F.load(st.snap);const T=ana(b.position.x,-b.position.y,b.velocity.x,-b.velocity.y,P.jumpReady);if(T<1e8)cand.push({st,est:T});}
cand.sort((a,c)=>a.est-c.est);
console.log('cands',cand.length,'best est',(T1+cand[0].est).toFixed(1));
let best=1e9,bj=null;
function miniBeam(st0){
  let bm=[{snap:st0.snap,hist:st0.hist,score:0}];let bestF=null;
  for(let t=T1;t<best&&t<300&&bm.length;t++){
    const kids=new Map();
    for(const st of bm){F.load(st.snap);const canJ=P.mode==='jump'&&P.jumpReady;
      for(let k=0;k<(canJ?2:1);k++){ if(k)F.load(st.snap); const j=canJ&&k===1; S.step({jump:j}); if(S.dead)continue;
        if(S.finished){const r=S.finishTick+1;if(!bestF||r<bestF.ticks)bestF={ticks:r,jumps:hl(j?{t,prev:st.hist}:st.hist)};continue;}
        const v2=b.velocity.x**2+b.velocity.y**2;const Hh=-b.position.y+v2/(2*g);
        const sc=TWm*(b.position.x+75)/Math.max(-b.velocity.x,CMIN)-G*Hh;
        const key=[Math.round(b.position.x/KQ),Math.round(b.position.y/KQ),Math.round(b.velocity.x),Math.round(b.velocity.y),P.jumpReady?1:0,Math.round((((b.angle%(Math.PI/2))+Math.PI/2)%(Math.PI/2))*KA),Math.round(b.angularVelocity*20)].join();
        const pr=kids.get(key);if(!pr||pr.score>sc)kids.set(key,{score:sc,snap:F.save(),hist:j?{t,prev:st.hist}:st.hist});}}
    if(bestF)break;
    bm=[...kids.values()].sort((a,c)=>a.score-c.score).slice(0,WB);
  }
  return bestF;
}
for(let i=0;i<Math.min(K,cand.length);i++){
  const r=miniBeam(cand[i].st);
  if(r&&r.ticks<best){best=r.ticks;console.log('cand',i,'est',(T1+cand[i].est).toFixed(1),'->',r.ticks,JSON.stringify(PRE.concat(r.jumps)));}
}
console.log('DONE best',best);
