// gravity-stage beam for level 21
const { Sim, loadLevel, cloneSim } = require('./boxel'); const { buildGrid } = require('./search'); const fs=require('fs');
const W=+process.argv[2]||80, TMIN=+process.argv[3]||3, MAXT=+process.argv[4]||3500, FIX=process.argv[5]?JSON.parse(process.argv[5]):null;
const L = loadLevel(21);
const BL=[[-8,-16],[120,-144],[-8,-272],[-136,-144]]; // matter coords of blocks: bottom(R),right(U),top(L),left(D)
const grids = BL.map(([x,y])=>{const s=new Sim(L); s.finishObjs[0].setPosition({x,y:-y,z:0}); return buildGrid(s);});
{const s=new Sim(L); s.finishObjs[0].setPosition({x:-104,y:-30,z:0}); grids.push(buildGrid(s));}
const GV=[[1,0],[0,-1],[-1,0],[0,1]];
const root=new Sim(L); root.stage=0; root.hist=null;
const FO=grids[4];
const FW=+process.env.FW||0.3, SB=+process.env.SB||40;
function score(s){const b=s.player.body; const k=s.stage; const g=grids[process.env.ANY?(GV.findIndex(v=>v[0]===s.engine.gravity.x&&v[1]===s.engine.gravity.y)+1)%4:k%4]; const d=g.at(b.position.x,b.position.y); const fb=s.finishObjs[0].body; const fo=FO.at(fb.position.x,fb.position.y); if(fo<(+process.env.CHR||50)){const fv=fb.velocity; return fo*FW + Math.hypot(fb.position.x-b.position.x,fb.position.y-b.position.y)/Math.max(Math.hypot(b.velocity.x-fv.x,b.velocity.y-fv.y),TMIN);} return fo*FW - k*SB + d/Math.max(Math.hypot(b.velocity.x,b.velocity.y),TMIN);}
function key(s){const b=s.player.body;return [s.stage,Math.round(b.position.x),Math.round(b.position.y),Math.round(b.velocity.x*4),Math.round(b.velocity.y*4),Math.round((((b.angle%1.5708)+1.5708)%1.5708)*10),s.player.jumpReady?1:0].join(',');}
const T0=+process.env.T0||0; const PJ=new Set(process.env.T0?require('../../../results/L21.json').jumps.filter(t=>t<T0):[]);
for(let t=0;t<T0;t++){const g0=root.engine.gravity.x+','+root.engine.gravity.y; root.step({jump:PJ.has(t)}); if(PJ.has(t))root.hist={t,prev:root.hist}; const g1=root.engine.gravity.x+','+root.engine.gravity.y; if(g0!==g1)root.stage++;}
let beam=[root]; let best=null;
for(let t=T0;t<MAXT;t++){
  const kids=new Map();
  for(const s of beam){
    const acts=(s.player.jumpReady && t>=1)?[true,false]:[false];
    for(let k=0;k<acts.length;k++){
      const c=k===acts.length-1?s:cloneSim(s); const g0=c.engine.gravity.x+','+c.engine.gravity.y; c.stage=s.stage;
      c.step({jump:acts[k]}); c.hist=acts[k]?{t,prev:s.hist}:s.hist;
      if(c.finished){const js=[];let h=c.hist;while(h){js.push(h.t);h=h.prev;} best={ticks:c.finishTick+1,jumps:js.reverse()}; break;}
      if(c.dead)continue;
      const g1=c.engine.gravity.x+','+c.engine.gravity.y;
      if(g1!==g0){ const e=GV[c.stage%4]; if(c.engine.gravity.x===e[0]&&c.engine.gravity.y===e[1]) c.stage++; else if(!process.env.ANY) continue; else c.stage++; }
      c.score=score(c); const kk=key(c); const p=kids.get(kk); if(!p||p.score>c.score)kids.set(kk,c);
    }
    if(best)break;
  }
  if(best)break;
  beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W); if(!beam.length){console.log('dead',t);break;}
  if(t%100==0)console.log('t',t,'stage',beam[0].stage,'score',beam[0].score.toFixed(0),'n',kids.size);
}
console.log(JSON.stringify(best||{fail:1}));
if(best)fs.appendFileSync('gb_found.jsonl',JSON.stringify({W,TMIN,...best})+'\n');
