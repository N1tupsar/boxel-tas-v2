const {Sim,loadLevel}=require('./boxel');
const J=new Set(JSON.parse(process.argv[2]||'[]'));const N=+(process.argv[3]||300),K=+(process.argv[4]||10);
const s=new Sim(loadLevel(29));
for(let t=0;t<N&&!s.dead&&!s.finished;t++){ if(t%K==0){const b=s.player.body;console.log(t,b.position.x.toFixed(1),(-b.position.y).toFixed(1),b.velocity.x.toFixed(2),(-b.velocity.y).toFixed(2),b.angle.toFixed(2),s.player.jumpReady?'R':'-')} s.step({jump:J.has(t)});}
console.log('end',s.tick,s.dead,s.finished);
