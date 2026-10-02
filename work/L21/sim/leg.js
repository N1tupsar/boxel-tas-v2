const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||2000,H=+process.argv[3]||400,TX=+process.argv[4],TY=+process.argv[5],GX=+process.argv[6],GY=+process.argv[7];
const LA=+(process.env.LA||6);const PRE=JSON.parse(process.env.PRE),T0=+process.env.T0;
const root=new Sim(loadLevel(21));const J=new Set(PRE);while(root.tick<T0)root.step({jump:J.has(root.tick)});root.hist=null;for(const t of PRE)if(t<T0)root.hist={t,prev:root.hist};
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};let beam=[root];
const out=[];
for(let t=T0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
   if(Math.round(c.engine.gravity.x)===GX&&Math.round(c.engine.gravity.y)===GY){out.push([t+1,JSON.stringify(hl(c.hist))]);}
   else{const b=c.player.body;c.score=Math.hypot(b.position.x+b.velocity.x*LA-TX,b.position.y+b.velocity.y*LA-TY);
   const kk=[b.position.x,b.position.y,b.velocity.x*3,b.velocity.y*3,b.angle*4].map(Math.round).join(',')+(c.player.jumpReady?1:0);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}}
 if(out.length){console.log('LEG',out[0][0],out[0][1]);process.exit()}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
console.log('none');
