const { Sim, loadLevel, cloneSim } = require('./boxel');
const H=+process.argv[2],W=+process.argv[3],TY=+process.argv[4]||590,TV=+process.argv[5]||-3;const PRE=JSON.parse(process.env.PRE),T0=+process.env.T0;
const root=new Sim(loadLevel(23));const J=new Set(PRE);while(root.tick<T0)root.step({jump:J.has(root.tick)});root.hist=null;for(const t of PRE)if(t<T0)root.hist={t,prev:root.hist};
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};let beam=[root];
for(let t=T0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
   const b=c.player.body,x=b.position.x,y=-b.position.y,vx=b.velocity.x;
   if(b.velocity.y>=+(process.env.VYD||1.0)&&c.player.jumpReady&&y>=TY&&x<=-95&&vx<=-3.0&&vx>=TV){console.log('REACH',t+1,x.toFixed(1),y.toFixed(1),vx.toFixed(2),(-b.velocity.y).toFixed(2),JSON.stringify(hl(c.hist)));process.exit()}
   c.score=Math.max(0,x+95)+Math.abs(Math.min(0,vx+3.4))*30+Math.max(0,y<TY?TY-y:0);
   const kk=[x,y,vx*4,b.velocity.y*4,b.angle*8].map(Math.round).join(',')+(c.player.jumpReady?1:0);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);}
console.log('none');
