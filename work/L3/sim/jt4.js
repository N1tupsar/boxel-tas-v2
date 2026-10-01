const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');const L=loadLevel(3);
const sp=+process.argv[2],V=+process.argv[3]||6.52;let res=[];
for(let a=0;a<1.571;a+=0.03)for(let x0=sp-290;x0<=sp-262;x0+=0.5){
const s=new Sim(L);const b=s.player.body;M.Body.setPosition(b,{x:x0,y:16.01});M.Body.setVelocity(b,{x:V,y:0});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,0);
s.player.jumpReady=true;s.step({jump:true});let ok=1;for(let i=0;i<70;i++){s.step({});if(s.dead){ok=0;break}}
if(ok)res.push([b.velocity.x-V,x0,a]);}
res.sort((p,q)=>q[0]-p[0]);console.log(sp,res.slice(0,4).map(r=>r.map(v=>v.toFixed(2)).join(' ')).join(' | '));
