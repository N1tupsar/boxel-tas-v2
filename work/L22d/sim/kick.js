const Matter=require('matter-js');const {Body}=Matter;const {Sim,loadLevel}=require('./boxel');const L=loadLevel(22);
let best=[];
for(let y0=-118;y0<=-58;y0+=6)for(let vy0=-5;vy0<=8;vy0+=1.5)for(let a=0;a<6.3;a+=0.4){
 const s=new Sim(L);const b=s.player.body;Body.setPosition(b,{x:215,y:y0});Body.setVelocity(b,{x:7.86,y:vy0});Body.setAngle(b,a);Body.setAngularVelocity(b,0);
 let mv=0,t0=0;for(let t=0;t<60&&!s.dead;t++){s.step({jump:false});if(b.position.y>20&&b.position.x<240&&b.velocity.x<mv){mv=b.velocity.x;t0=t}}
 if(!s.dead)best.push([mv,y0,vy0,a,t0]);}
best.sort((p,q)=>p[0]-q[0]);console.log(best.slice(0,8).map(r=>r.map(v=>+v.toFixed(2)).join(',')).join(' | '));
