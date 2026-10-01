const {Sim,loadLevel}=require('./boxel');const M=require('matter-js');const L=loadLevel(3);
const X=+process.argv[2]||169, SP=+process.argv[3]||424;
let res=[];
for(let x0=X-12;x0<=X+12;x0+=0.5)for(let a=0;a<1.57;a+=0.05)for(const w0 of [0,0.15,0.3,-0.15]){
const s=new Sim(L);const b=s.player.body;M.Body.setPosition(b,{x:x0,y:16.01});M.Body.setVelocity(b,{x:5.6,y:0});M.Body.setAngle(b,a);M.Body.setAngularVelocity(b,w0);
s.player.jumpReady=true;s.step({jump:true});let ok=1;for(let i=0;i<60;i++){s.step({});if(s.dead){ok=0;break}}
if(ok)res.push([b.velocity.x-5.6,x0,a,w0]);}
res.sort((p,q)=>q[0]-p[0]);console.log(res.slice(0,5).map(r=>r.map(v=>v.toFixed(2)).join(' ')).join('\n'));
