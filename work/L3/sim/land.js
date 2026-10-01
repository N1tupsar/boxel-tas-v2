const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');
const L=loadLevel(3);
function trial(a,w,vy,vx=5.6,h=0){const s=new Sim(L);const b=s.player.body;
 M.Body.setPosition(b,{x:200,y:24-8-h});M.Body.setVelocity(b,{x:vx,y:vy});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,w);
 for(let i=0;i<30;i++){s.step({});}
 return {vx:b.velocity.x,w:b.angularVelocity,vy:b.velocity.y,x:b.position.x};}
let best=[];
for(const w of [0.157,-0.157,0.1,0.3,0])for(const vy of [3,6,8,10]){let r=[];for(let a=0;a<Math.PI/2;a+=0.05){const t=trial(a,w,vy,5.6,20);r.push([a,t.vx-5.6])}
 r.sort((p,q)=>q[1]-p[1]);console.log('w',w,'vy',vy,'best',r[0][0].toFixed(2),r[0][1].toFixed(3),'worst',r[r.length-1][0].toFixed(2),r[r.length-1][1].toFixed(3))}
