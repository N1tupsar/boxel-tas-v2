// node work/mkresults.js -> results/RESULTS.md (re-emulates every route; counts tips touched)
const fs=require('fs'),path=require('path');
const {Sim,loadLevel}=require('../sim/boxel');const R=path.join(__dirname,'..','results');
let rows=[],tot=0;
for(let n=1;n<=30;n++){ if(n===17)continue;
  const f=path.join(R,`L${n}.json`); if(!fs.existsSync(f)){rows.push(`| ${n} | – | – | – | – | no route |`);continue;}
  const j=JSON.parse(fs.readFileSync(f)); const {emulate}=require('../sim/tas'); const r=emulate(loadLevel(n),j.tas);
  // tips: re-run with jumps, count hidden tips
  const tas=[...j.tas]; const pre=tas[0]==='p0'; if(pre)tas.shift(); const s=new Sim(loadLevel(n),pre?{preTouch:true}:{}); const J=new Set(r.jumped);
  while(s.tick<4000&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});
  const tips=s.objects.filter(o=>o.cls==='tip'&&!o.visible).length;
  const ok=r.finished&&!r.dead; if(ok)tot+=r.ticks;
  rows.push(`| ${n} | ${ok?r.ticks:'FAIL'} | ${ok?((r.ticks-1.5)/60).toFixed(2):'–'} | ${tips} | \`loadInputs(${JSON.stringify(j.tas)})\` | by ${j.by||'?'} |`);
}
fs.writeFileSync(path.join(R,'RESULTS.md'),`# Results (theory mode, snapped start, jumpReady=true)\n\nFrames are sim frames; seconds = (frames-1.5)/60 approximates the in-game timer. Baseline comparisons: BASELINE_CMP.md, BASELINE_CMP_A.md. Level 17 excluded. Base-game success rate (rate.js) not measured.\n\n| Level | Frames | In-game s (approx) | Tips | loadInputs | Note |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n\nTotal frames (valid routes): ${tot}\n`);
console.log('total',tot);
