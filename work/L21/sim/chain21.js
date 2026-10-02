const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||2000,LA=+(process.env.LA||6),NZ=+(process.env.NOISE||0);let _sd=+(process.env.SEED||1);const rnd=()=>{_sd=(_sd*1664525+1013904223)>>>0;return _sd/4294967296};
const P=[[-8,-112],[24,-112],[24,-176],[-40,-176],[-40,-80],[56,-80],[56,-208],[-72,-208],[-72,-48],[88,-48],[88,-240],[-104,-240],[-104,-16],[120,-16],[120,-272]];
const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
const fo=s=>s.objects.find(o=>o.cls==='finish').body;
function prog(x,y){let bs=0,bd=1e9;for(let i=1;i<P.length;i++){const ax=P[i-1][0],ay=P[i-1][1],bx=P[i][0],by=P[i][1];const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let u=((x-ax)*dx+(y-ay)*dy)/L2;u=Math.max(0,Math.min(1,u));const px=ax+u*dx,py=ay+u*dy;const d=Math.hypot(x-px,y-py);if(d<bd){bd=d;bs=cum[i-1]+u*Math.sqrt(L2)}}return bs}
const BLK=[{p:[-8,-16],g:[1,0]},{p:[120,-144],g:[0,-1]},{p:[-8,-272],g:[-1,0]},{p:[-136,-144],g:[0,1]}];
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
let cur=new Sim(loadLevel(21));cur.hist=null;let tick=0;const NL=+(process.env.LEGS||10);
for(let leg=0;leg<NL;leg++){const B=BLK[leg%4];const need=cum[Math.min(leg,cum.length-1)]; // finish must be at corner 'leg' (end of segment leg) before trigger
 let beam=[cur];let found=null;
 for(let t=tick;t<tick+260&&!found;t++){const kids=new Map();
  for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
   for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
    const gx=Math.round(c.engine.gravity.x),gy=Math.round(c.engine.gravity.y);
    if(gx===B.g[0]&&gy===B.g[1]){const f=fo(c).position;const sf=prog(f.x,f.y);if(sf>=need-10){found=c;break}else continue}
    const b=c.player.body;c.score=Math.hypot(b.position.x+b.velocity.x*LA-B.p[0],b.position.y+b.velocity.y*LA-B.p[1])+(NZ?NZ*rnd():0);
    const kk=[b.position.x,b.position.y,b.velocity.x*3,b.velocity.y*3,b.angle*4].map(Math.round).join(',')+(c.player.jumpReady?1:0);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}
   if(found)break}
  if(found)break;
  beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
 if(!found){console.log('LEG',leg,'failed');break}
 cur=found;tick=found.tick;console.log('LEG',leg,'done tick',tick,'sf',prog(fo(found).position.x,fo(found).position.y).toFixed(0),'jumps',JSON.stringify(hl(found.hist)).slice(-60));
}
console.log('JUMPS',JSON.stringify(hl(cur.hist)),'tick',tick);
