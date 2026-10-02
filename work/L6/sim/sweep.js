// node sweep.js PRE T0 T1 IDX MOD   : handle states i where i%MOD==IDX
const { Sim, loadLevel } = require('./boxel'); const { mkFast } = require('./fast');
const PRE=JSON.parse(process.argv[2]), T0=+process.argv[3], T1=+process.argv[4], IDX=+process.argv[5], MOD=+process.argv[6];
const T00=+(process.argv[7]||PRE[PRE.length-1]+1);
const S=new Sim(loadLevel(6)),F=mkFast(S),P=S.player,b=P.body;
const g=0.001*(1000/60)**2;
const J=new Set(PRE); for(let t=0;t<T00;t++)S.step({jump:J.has(t)});
function hl(h){const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()}
function ana(x,y,vx,vy,ready){
  if(vx>-5)return Infinity; const T=(x+72)/(-vx); let bestT=Infinity;
  const taus=ready?[...Array(Math.ceil(T)+1).keys()].concat([-1]):[-1];
  for(const tau of taus){
    const yAt=(tt)=>{ if(tau<0||tt<=tau) return y+vy*tt-g*tt*tt/2; const y1=y+vy*tau-g*tau*tau/2; const d=tt-tau; return y1+6.667*d-g*d*d/2; };
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
function bfs(start,t0,t1,cap){
  let beam=[start];
  for(let t=t0;t<t1;t++){
    const kids=new Map();
    for(const st of beam){F.load(st.snap);const canJ=P.jumpReady;
      for(let k=0;k<(canJ?2:1);k++){ if(k)F.load(st.snap); const j=canJ&&k===1; S.step({jump:j}); if(S.dead||S.finished)continue;
        const key=[b.position.x.toFixed(3),b.position.y.toFixed(3),b.velocity.x.toFixed(3),b.velocity.y.toFixed(3),b.angle.toFixed(3),b.angularVelocity.toFixed(4),P.jumpReady?1:0].join();
        if(!kids.has(key))kids.set(key,{snap:F.save(),hist:j?{t,prev:st.hist}:st.hist});}}
    beam=[...kids.values()]; if(beam.length>cap)return null;
  }
  return beam;
}
const start0={snap:F.save(),hist:null};
const lvl=bfs(start0,T00,T0,1e6);
console.log('states at',T0,lvl.length);
let gbest=1e9;
lvl.forEach((st,i)=>{ if(i%MOD!==IDX)return;
  const res=bfs(st,T0,T1,6e6); if(!res){console.log('state',i,'cap');return;}
  let best=1e9,bj=null,bx=0;
  for(const s2 of res){F.load(s2.snap);const T=ana(b.position.x,-b.position.y,b.velocity.x,-b.velocity.y,P.jumpReady);if(T<1e8&&T1+T<best){best=T1+T;bj=hl(s2.hist);}}
  console.log('state',i,'n',res.length,'best est',best.toFixed(1),JSON.stringify(PRE.concat(hl(st.hist),bj||[])));
  if(best<gbest){gbest=best;}
});
console.log('DONE',gbest);
