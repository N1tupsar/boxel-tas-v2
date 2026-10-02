// beam over gravity schedules for the finish body alone (player parked)
const { Sim, loadLevel, cloneSim } = require('./boxel');
const W=+process.argv[2]||2000,H=+process.argv[3]||600;
const root=new Sim(loadLevel(21));
const fo=s=>s.objects.find(o=>o.cls==='finish').body;
const dirs=[[1,0],[0,-1],[-1,0],[0,1]];
function out(s){const p=fo(s).position;return Math.max(Math.abs(p.x-(-8)),Math.abs(p.y-(-144)))}
let beam=[root];root.hist=null;root.score=0;root.gd=-1;
const hl=h=>{const o=[];while(h){o.push(h.t+':'+h.d);h=h.prev}return o.reverse()};
for(let t=0;t<H;t++){const kids=new Map();
 for(const s of beam){const opts=[-2,0,1,2,3];// -2 keep; else set gravity dir index
  for(const d of opts){if(d>=0&&d===s.gd)continue;const c=d===-2?s:cloneSim(s);
   if(d>=0){c.engine.gravity.x=dirs[d][0];c.engine.gravity.y=dirs[d][1];c.gd=d;c.hist={t,d,prev:s.hist}}else{c.gd=s.gd;c.hist=s.hist}
   c.step({});const p=fo(c).position;const o=out(c);
   if(o>=140){console.log('EXIT',t+1,JSON.stringify(hl(c.hist)));process.exit()}
   c.score=-o; // want far from center; use progress along path? crude
   const k=[p.x,p.y,fo(c).velocity.x*2,fo(c).velocity.y*2,c.gd].map(Math.round).join();const q=kids.get(k);if(!q||q.score>c.score)kids.set(k,c)}}
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);if(t%50==0)console.log('t',t,beam[0].score.toFixed(0))}
console.log('none');
