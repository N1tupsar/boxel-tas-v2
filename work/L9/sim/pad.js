const {Sim,loadLevel,cloneSim}=require('./boxel');const L=loadLevel(9);
const j=require('../../../results/L9.json').jumps;const T0=+process.argv[2],W=+process.argv[3];
const J=new Set(j.filter(t=>t<T0));const root=new Sim(L);while(root.tick<T0)root.step({jump:J.has(root.tick)});
let found=0;
function rec(s,t,depth,hist){ // choose next jump tick in [t,T0+W]
  // simulate without further jumps for 80 ticks check bounce
  const c=cloneSim(s);let ev=0;for(let k=0;k<80&&!c.dead&&!c.finished;k++){c.step({jump:false});if(c.events.some(e=>e[1]=='bounce')){ev=1;break}}
  if(ev){found++;const b=c.player.body;if(b.velocity.x<-3)console.log('BOUNCE',JSON.stringify(hist),'tick',c.tick,'v',b.velocity.x.toFixed(1),(-b.velocity.y).toFixed(1),'pos',b.position.x.toFixed(0),(-b.position.y).toFixed(0))}
  if(depth==0)return;
  const c2=cloneSim(s);
  for(let u=t;u<=T0+W;u++){ if(u>t)c2.step({jump:false}); if(c2.dead)break; if(!c2.player.jumpReady)continue; const c3=cloneSim(c2);c3.step({jump:true});if(c3.dead)continue; rec(c3,u+1,depth-1,[...hist,u]); }
}
rec(root,T0,+process.argv[4]||2,[]);console.log('found',found);
