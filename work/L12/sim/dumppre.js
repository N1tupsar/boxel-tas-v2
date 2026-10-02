// enumerate distinct prefix jump lists reaching tick H with speed>=VMIN, dedupe by (vx,vy,angle rounded)
const { Sim, loadLevel, cloneSim } = require('./boxel');
const H=+process.argv[2]||30, VMIN=+process.argv[3]||5.3;
const root=new Sim(loadLevel(12));root.hist=null;let beam=[root];
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
for(let t=0;t<H;t++){const kids=[];
 for(const s of beam){const acts=(t>=1&&s.player.jumpReady)?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(!c.dead)kids.push(c)}}
 const m=new Map();for(const c of kids){const b=c.player.body;const k=[b.position.x,b.position.y,b.velocity.x,b.velocity.y,b.angle,b.angularVelocity].map(v=>v.toFixed(3)).join()+(c.player.jumpReady?1:0);if(!m.has(k))m.set(k,c)}beam=[...m.values()];}
const seen=new Set(),out=[];
for(const s of beam){const b=s.player.body;if(b.velocity.x<VMIN&&!(process.env.ALL))continue;const k=[b.position.x,b.position.y,b.velocity.y,b.angle].map(v=>v.toFixed(2)).join();if(seen.has(k))continue;seen.add(k);out.push({j:hl(s.hist),vx:b.velocity.x,x:b.position.x})}
console.error(beam.length,out.length);
require('fs').writeFileSync("pres.json",JSON.stringify(out));
