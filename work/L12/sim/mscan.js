const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');const L=loadLevel(12);
const X0=+process.argv[2],V=+process.argv[3]||10.35;let res=[];
for(let x=X0-20;x<=X0+40;x+=3)for(let y=-110;y<=-60;y+=3)for(const vy of [-8,-5,-2,2,5,8])for(let a=0;a<1.571;a+=0.3)for(const w of [0.157,0]){
 const s=new Sim(L);const b=s.player.body;M.Body.setPosition(b,{x:x,y:-y});M.Body.setVelocity(b,{x:V,y:-vy});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,w);
 let ok=1;for(let i=0;i<14;i++){s.step({});if(s.dead){ok=0;break}}
 if(ok)res.push([b.velocity.x-V,x,y,vy,a,w]);}
res.sort((p,q)=>q[0]-p[0]);console.log(res.slice(0,5).map(r=>r.map(v=>v.toFixed(2)).join(' ')).join(' | '));
