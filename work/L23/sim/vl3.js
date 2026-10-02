const { Sim, loadLevel, cloneSim } = require('./boxel');
const H=+process.argv[2],W=+process.argv[3];const PRE=JSON.parse(process.env.PRE),T0=+process.env.T0;
const root=new Sim(loadLevel(23));const J=new Set(PRE);while(root.tick<T0)root.step({jump:J.has(root.tick)});root.hist=null;for(const t of PRE)if(t<T0)root.hist={t,prev:root.hist};
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};let beam=[root];
for(let t=T0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
   const b=c.player.body,x=b.position.x,y=-b.position.y;
   c.score=(y>420&&x<110)? b.velocity.x : 1000+Math.hypot(x-70,y-470);
   const kk=[x,y,b.velocity.x*4,b.velocity.y*4,b.angle*8].map(Math.round).join(',')+(c.player.jumpReady?1:0);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
 if(t%20==0){const b=beam[0].player.body;console.log(t,beam[0].score.toFixed(2),b.position.x.toFixed(0),(-b.position.y).toFixed(0))}}
const b=beam[0].player.body;console.log('END',b.position.x.toFixed(1),(-b.position.y).toFixed(1),b.velocity.x.toFixed(2),b.velocity.y.toFixed(2),JSON.stringify(hl(beam[0].hist)));
