const {Sim,loadLevel}=require('./boxel');const n=+process.argv[2];const s=new Sim(loadLevel(n));const J=new Set(JSON.parse(process.argv[3]));const st=+process.argv[4]||10;let lg='';
while(!s.finished&&!s.dead&&s.tick<1500){s.step({jump:J.has(s.tick)});const b=s.player.body;const g=s.engine.gravity.x+','+s.engine.gravity.y;if(s.tick%st==0||g!=lg){lg=g;console.log(s.tick,b.position.x.toFixed(0),(-b.position.y).toFixed(0),b.velocity.x.toFixed(1),(-b.velocity.y).toFixed(1),'g'+g,s.player.scale.x)}}
console.log(s.finished?'FIN '+(s.finishTick+1):s.dead?'dead':'no')
