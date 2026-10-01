const Matter=require('matter-js');const {Body}=Matter;const {Sim,loadLevel}=require('./boxel');
for(const ang of [0]) for(let v=8;v<=44;v+=2){ const res=[];
 for(let ph=0;ph<8;ph++){ const s=new Sim(loadLevel(13)); const b=s.player.body;
  Body.setAngle(b,0);Body.setAngularVelocity(b,0);Body.setPosition(b,{x:-168+60+ph*2,y:-300});Body.setVelocity(b,{x:-v,y:0});
  s.engine.gravity.x=0;s.engine.gravity.y=0; // isolate
  let tunnelled=false;
  for(let t=0;t<30;t++){ s.step({jump:false}); Body.setVelocity(b,{x:b.velocity.x,y:0}); if(b.position.x<-168-8-8+0.1){tunnelled=true;break} }
  res.push(tunnelled?1:0);}
 console.log('v',v,res.join(''));}
