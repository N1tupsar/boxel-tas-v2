const {run,loadLevel}=require('./boxel');
const J=JSON.parse(process.argv[2]);
const {sim,trace}=run(loadLevel(+process.env.L||3),J,600,{trace:true});
console.log('end',sim.tick,sim.finished,sim.dead);
trace.forEach((s,i)=>{if(i%(+process.argv[3]||10)==0||J.includes(i))console.log(i+1,s.x.toFixed(1),s.y.toFixed(1),s.vx.toFixed(2),s.vy.toFixed(2),(s.a).toFixed(2),s.ready?'R':'', J.includes(i)?'J':'')});
