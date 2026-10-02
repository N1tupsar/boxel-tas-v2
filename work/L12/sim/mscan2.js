const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');const L=loadLevel(12);
const X0=984,V=10.35;
for(const vy of [3,4,5,6,6.67,7,8,9,10]){let best=[-9];
for(let x=X0-20;x<=X0+40;x+=2)for(let y=-120;y<=-60;y+=2)for(let a=0;a<1.571;a+=0.2)for(const w of [0.157,0]){
 const s=new Sim(L);const b=s.player.body;M.Body.setPosition(b,{x:x,y:-y});M.Body.setVelocity(b,{x:V,y:-vy});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,w);
 let ok=1;for(let i=0;i<14;i++){s.step({});if(s.dead){ok=0;break}}
 if(ok&&b.velocity.x-V>best[0])best=[b.velocity.x-V,x,y,a,w];}
console.log('vy',vy,best.map(v=>v.toFixed?v.toFixed(2):v).join(' '))}
