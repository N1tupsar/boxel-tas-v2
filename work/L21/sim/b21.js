const { Sim, loadLevel, cloneSim } = require('./boxel'); const { buildGrid } = require('./search');
const W=+process.argv[2]||1000,H=+process.argv[3]||700,LAM=+(process.env.LAM||0.3);
const root=new Sim(loadLevel(21));const grid=buildGrid(root,4);const PB={};for(const k of Object.keys({left:0,top:0,bottom:0,right:0}))PB[k]=null;
const fo=s=>s.objects.find(o=>o.cls==='finish').body;
const BL={left:[-136,-144],top:[-8,-272],bottom:[-8,-16],right:[120,-144]};for(const k in BL)PB[k]=buildGrid(root,8,{x:BL[k][0],y:BL[k][1]});const P=[[-8,-112],[24,-112],[24,-176],[-40,-176],[-40,-80],[56,-80],[56,-208],[-72,-208],[-72,-48],[88,-48],[88,-240],[-104,-240],[-104,-16],[120,-16],[120,-272]];
const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
function prog(x,y){let bs=0,bd=1e9;for(let i=1;i<P.length;i++){const ax=P[i-1][0],ay=P[i-1][1],bx=P[i][0],by=P[i][1];const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let u=((x-ax)*dx+(y-ay)*dy)/L2;u=Math.max(0,Math.min(1,u));const px=ax+u*dx,py=ay+u*dy;const d=Math.hypot(x-px,y-py);if(d<bd){bd=d;bs=cum[i-1]+u*Math.sqrt(L2)}}return bs}
const TOT=cum[cum.length-1];const GEX=1480;let best=1e9,bestJ=null;
root.hist=null;let beam=[root];
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=(t>=1&&s.player.jumpReady)?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;
   if(c.dead)continue;if(c.finished){console.log('FIN',c.finishTick+1,JSON.stringify(hl(c.hist)));process.exit()}
   const f=fo(c).position,p=c.player.body.position;const gf=grid.at(f.x,f.y);
   const dpf=Math.hypot(p.x-f.x,p.y-f.y);
   const gx=Math.round(c.engine.gravity.x),gy=Math.round(c.engine.gravity.y);
   const nk=(gx==0&&gy==1)?'bottom':(gx==1)?'right':(gy==-1)?'top':'left';
   const LA=+(process.env.LA||8);const vv=c.player.body.velocity;const dnb=PB[nk].at(p.x+vv.x*LA,p.y+vv.y*LA);
   const sf=prog(f.x,f.y);c.score = (sf<TOT-60? (TOT-sf)+LAM*dnb : 100+dpf);
   const key=[p.x,p.y,c.player.body.velocity.x*2,c.player.body.velocity.y*2,f.x/4,f.y/4,c.player.jumpReady?1:0,Math.round(c.engine.gravity.x)+','+Math.round(c.engine.gravity.y)].map(v=>typeof v=='number'?Math.round(v):v).join(',');
   const q=kids.get(key);if(!q||q.score>c.score)kids.set(key,c)}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
 if(t%50==0){const f=fo(beam[0]).position;const pp=beam[0].player.body.position;console.log('player',pp.x.toFixed(0),pp.y.toFixed(0),'g',beam[0].engine.gravity.x,beam[0].engine.gravity.y);console.log('t',t,beam[0].score.toFixed(0),'fin',f.x.toFixed(0),f.y.toFixed(0),'gf',grid.at(f.x,f.y).toFixed(0))}}
console.log('none');
