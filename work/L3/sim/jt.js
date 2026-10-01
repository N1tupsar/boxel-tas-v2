const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');const L=loadLevel(3);
let res=[];
for(let x0=166;x0<=173;x0+=0.05)for(let a=0;a<1.57;a+=0.02){
const s=new Sim(L);const b=s.player.body;M.Body.setPosition(b,{x:x0,y:16.01});M.Body.setVelocity(b,{x:5.6,y:0});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,0);
s.player.jumpReady=true;s.step({});s.step({jump:true});let ok=1;for(let i=0;i<70;i++){s.step({});if(s.dead){ok=0;break}}
if(ok)res.push([b.velocity.x-5.6,x0,a,b.position.x]);}
res.sort((p,q)=>q[0]-p[0]);console.log(res.slice(0,6).map(r=>r.map(v=>v.toFixed(2)).join(' ')).join('\n'));
