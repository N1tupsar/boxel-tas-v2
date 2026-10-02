const { Sim, loadLevel, cloneSim } = require('./boxel'); const { buildGrid } = require('./search');
const W=+process.argv[2]||1000,H=+process.argv[3]||700,LA=+(process.env.LA||8),NZ=+(process.env.NOISE||0);
let _sd=+(process.env.SEED||1);const rnd=()=>{_sd=(_sd*1664525+1013904223)>>>0;return _sd/4294967296};
const root=new Sim(loadLevel(21));
const BL={left:[-136,-144],top:[-8,-272],bottom:[-8,-16],right:[120,-144]};
const fo=s=>s.objects.find(o=>o.cls==='finish').body;
const P=[[-8,-112],[24,-112],[24,-176],[-40,-176],[-40,-80],[56,-80],[56,-208],[-72,-208],[-72,-48],[88,-48],[88,-240],[-104,-240],[-104,-16],[120,-16],[120,-272]];
const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
function prog(x,y){let bs=0,bd=1e9;for(let i=1;i<P.length;i++){const ax=P[i-1][0],ay=P[i-1][1],bx=P[i][0],by=P[i][1];const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let u=((x-ax)*dx+(y-ay)*dy)/L2;u=Math.max(0,Math.min(1,u));const px=ax+u*dx,py=ay+u*dy;const d=Math.hypot(x-px,y-py);if(d<bd){bd=d;bs=cum[i-1]+u*Math.sqrt(L2)}}return bs}
const TOT=cum[cum.length-1];
// gravity cycle: D(0,1) -> R(1,0) -> U(0,-1) -> L(-1,0) -> D
const cyc=[[0,1],[1,0],[0,-1],[-1,0]];const blk=['bottom','right','top','left'];const BLK2=blk;// block that triggers cyc[(i+1)%4]
const gi=(x,y)=>{x=Math.round(x);y=Math.round(y);for(let i=0;i<4;i++)if(cyc[i][0]==x&&cyc[i][1]==y)return i;return -1};
root.hist=null;root.stage=0;root.pen=0;root.gcur=0;let beam=[root];
const T0=+(process.env.T0||0);
if(T0){const PJ=JSON.parse(process.env.PREJ).filter(t=>t<T0),JS=new Set(PJ);while(root.tick<T0){root.step({jump:JS.has(root.tick)});const g=gi(root.engine.gravity.x,root.engine.gravity.y);if(g!==root.gcur&&g>=0){if(g===(root.gcur+1)%4)root.stage++;root.gcur=g}}
 for(const t of PJ)root.hist={t,prev:root.hist}}
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
for(let t=T0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=(t>=1&&s.player.jumpReady)?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;
   if(c.dead)continue;if(c.finished){console.log('FIN',c.finishTick+1,JSON.stringify(hl(c.hist)));process.exit()}
   if(k!=acts.length-1){c.stage=s.stage;c.pen=s.pen;c.gcur=s.gcur}
   const g=gi(c.engine.gravity.x,c.engine.gravity.y);
   if(g!==c.gcur&&g>=0){ // gravity changed
     const f=fo(c).position;const sf=prog(f.x,f.y);
     if(g===(c.gcur+1)%4){c.stage++;const need=cum[Math.min(c.stage-2,cum.length-1)];if(sf<need-(+process.env.TOL||10))continue;}else{continue}
     c.gcur=g;if(process.env.STOP&&c.stage>=+process.env.STOP){console.log('STAGE',c.stage,'tick',t+1,JSON.stringify(hl(c.hist)),'v',c.player.body.velocity.x.toFixed(1),c.player.body.velocity.y.toFixed(1));process.exit()}}
   const p=c.player.body.position,vv=c.player.body.velocity,f=fo(c).position;const sf=prog(f.x,f.y);
   const nk=blk[c.gcur];
   let sc;
   if(c.stage<(+process.env.K0||12)){let dnb;
     if(process.env.EST){const gx=c.engine.gravity.x,gy=c.engine.gravity.y,gl=Math.hypot(gx,gy)||1,ux=gx/gl,uy=gy/gl;const rx=BL[nk][0]-p.x,ry=BL[nk][1]-p.y;const along=rx*ux+ry*uy;const perp=rx*(-uy)+ry*ux;const vG=vv.x*ux+vv.y*uy,vP=vv.x*(-uy)+vv.y*ux;const a=0.2778;
       let tG; if(along<=6){tG=0}else{tG=(-vG+Math.sqrt(vG*vG+2*a*along))/a}
       let tP; if(Math.abs(perp)<=8){tP=0}else{const vt=vP*Math.sign(perp);tP=vt>0.3?Math.abs(perp)/vt:Math.abs(perp)/0.3}
       dnb=Math.max(tG,tP)*(+process.env.EST)+0.01*Math.hypot(rx,ry)}
     else dnb=Math.hypot(p.x+vv.x*LA-BL[nk][0],p.y+vv.y*LA-BL[nk][1]);sc=-c.stage*10000+c.pen+Math.min(dnb,3000)-(+process.env.SP||0)*Math.hypot(vv.x,vv.y)+(NZ?NZ*rnd():0)}
   else{
     // chase: path distance along spiral when the player is inside a corridor, else distance to exit E plus finish remaining
     let bd=1e9,bsp=0;for(let i=1;i<P.length;i++){const ax=P[i-1][0],ay=P[i-1][1],bx=P[i][0],by=P[i][1];const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let u=((p.x-ax)*dx+(p.y-ay)*dy)/L2;u=Math.max(0,Math.min(1,u));const px=ax+u*dx,py=ay+u*dy;const d=Math.hypot(p.x-px,p.y-py);if(d<bd){bd=d;bsp=cum[i-1]+u*Math.sqrt(L2)}}
     const E=P[12];let dd; if(bd<14&&bsp<=cum[12]+2) dd=Math.abs(sf-bsp); else dd=Math.hypot(p.x-E[0],p.y-E[1])+Math.max(0,cum[12]-sf);
     sc=-200000+dd}
   c.score=sc;
   const key=[p.x,p.y,vv.x*2,vv.y*2,f.x/4,f.y/4,c.player.jumpReady?1:0,c.gcur,c.stage].map(v=>Math.round(v)).join(',');
   const q=kids.get(key);if(!q||q.score>c.score)kids.set(key,c)}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
 if(t%50==0){const b=beam[0];console.log('t',t,'stage',b.stage,'pen',b.pen.toFixed(0),'sc',b.score.toFixed(0))}}
console.log('none');
