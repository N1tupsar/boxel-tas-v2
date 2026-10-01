const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');const L=loadLevel(3);
const sp=+process.argv[2],V=+process.argv[3]||6.52;
for(const a of [0,0.3,0.6,0.85,1.2]){let best=[-9];
for(let x0=sp-330;x0<=sp-120;x0+=0.5){
const s=new Sim(L);const b=s.player.body;M.Body.setPosition(b,{x:x0,y:16.01});M.Body.setVelocity(b,{x:V,y:0});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,0);
s.player.jumpReady=true;s.step({jump:true});let ok=1;for(let i=0;i<70;i++){s.step({});if(s.dead){ok=0;break}}
if(ok&&b.velocity.x-V>best[0])best=[b.velocity.x-V,x0,b.position.x];}
console.log(sp,'a',a,best.map(v=>v.toFixed(2)).join(' '));}
