const { Sim, loadLevel, cloneSim } = require('./boxel');
const Matter=require('matter-js');
// platform at 1056,184 (x 1032..1080, y 176..192). scan states, 1-3 jumps in window, maximize final vx after 8 ticks
const base=new Sim(loadLevel(30));
let best=[];
function run(dx,dy,ang,w,vy,pattern){
 const s=cloneSim(base);const b=s.player.body;
 Matter.Body.setPosition(b,{x:1056+dx,y:-(176-8-dy)});Matter.Body.setAngle(b,ang);Matter.Body.setAngularVelocity(b,w);Matter.Body.setVelocity(b,{x:12,y:-vy});
 s.player.jumpReady=true;
 for(let t=0;t<10;t++){s.step({jump:pattern>>t&1&&s.player.jumpReady});if(s.dead)return null}
 return s.player.body.velocity.x;
}
for(const dy of [0,4,9,14,20,30])for(let dx=-44;dx<=44;dx+=4)for(let a=0;a<16;a++)for(const w of [0,0.157,-0.157,0.6,-0.6,1.2])for(const vy of [3,6,10,14])for(const pat of [0]){
 const v=run(dx,dy,a*Math.PI/32,w,vy,pat);if(v!==null)best.push([v,dx,dy,a,w,vy,pat]);}
best.sort((a,b)=>b[0]-a[0]);for(const V of [3,6,10,14]){const bb=best.filter(r=>r[5]===V);console.log('vy',V,bb[0].map(x=>+x.toFixed(2)).join(' '))}
console.log(best.slice(0,0).map(r=>r.map(x=>+x.toFixed(2)).join(' ')).join('\n'));
