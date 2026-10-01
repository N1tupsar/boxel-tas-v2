const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||4000,H=+process.argv[3]||60;
const L=loadLevel(22);const root=new Sim(L);root.hist=null;root.cr=false;let beam=[root];const res=[];
const key=s=>{const b=s.player.body;return [Math.round(b.position.x/3),Math.round(b.position.y/3),Math.round(b.velocity.x*3),Math.round(b.velocity.y*3),Math.round(b.angle*5),s.player.jumpReady?1:0].join(',')};
function evalRoll(s){const c=cloneSim(s);let mv=0,tk=0,x=0;for(let i=0;i<70&&!c.dead&&!c.finished;i++){c.step({jump:false});const b=c.player.body;if(b.position.y>20&&b.position.x<240&&b.velocity.x<mv){mv=b.velocity.x;tk=c.tick;x=b.position.x}}
 if(mv>=-1)return null;return {est:tk+(x+56)/(-mv),mv,tk}}
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const acts=s.player.jumpReady?[true,false]:[false];
  for(let k=0;k<acts.length;k++){const c=k===acts.length-1?s:cloneSim(s);const cr=s.cr;c.step({jump:acts[k]});c.cr=cr;c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead||c.finished)continue;
   const b=c.player.body;
   if(!c.cr&&b.position.x>=213){c.cr=true;const e=evalRoll(c);if(e){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev}res.push({...e,t:c.tick,y:b.position.y,vy:b.velocity.y,vx:b.velocity.x,jumps:js.reverse()})}continue}
   if(c.cr)continue;
   c.score=-b.position.x-b.velocity.x*8+c.tick*0;const kk=key(c);const p=kids.get(kk);if(!p||p.score>c.score)kids.set(kk,c);}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);if(!beam.length)break;}
res.sort((a,b)=>a.est-b.est);require("fs").writeFileSync("xc_top.json",JSON.stringify(res.slice(0,400).map(r=>({est:r.est,mv:r.mv,t:r.t,jumps:r.jumps}))));console.log(res.length,JSON.stringify(res.slice(0,6).map(r=>({est:+r.est.toFixed(1),mv:+r.mv.toFixed(2),tk:r.tk,t:r.t,y:Math.round(r.y),vy:+r.vy.toFixed(1),vx:+r.vx.toFixed(1),jumps:r.jumps}))));
