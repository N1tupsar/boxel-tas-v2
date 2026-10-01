const { Sim, loadLevel, cloneSim } = require('./boxel');
const L=loadLevel(3);const W=+process.argv[2],T=+process.argv[3];
const root=new Sim(L);let beam=[root];
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/2),Math.round(b.position.y/2),Math.round(b.velocity.x*5),Math.round(b.velocity.y*5),Math.round(b.angle*6),Math.round(b.angularVelocity*40),s.player.jumpReady?1:0].join(',')};
for(let t=0;t<T;t++){const kids=new Map();for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});if(c.dead)continue;c.score=-(c.player.body.velocity.x*50+c.player.body.position.x*0.2);const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c)}}
beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);if(t%25==24){const b=beam[0].player.body;console.log(t+1,'best vx',b.velocity.x.toFixed(2),'x',b.position.x.toFixed(0),'av',b.angularVelocity.toFixed(2))}}
