const fs=require('fs');const {emulate}=require('../../sim/tas');const {loadLevel}=require('../../sim/boxel');
const md=fs.readFileSync('baselines/BASELINE_RESULTS.md','utf8').split('\n');const bj=JSON.parse(fs.readFileSync('baselines/best_baseline.json'));
const rows=[];
for(const n of [3,4,7,8,9,10]){const line=md.find(l=>l.startsWith(`| ${n} |`));const m=line.match(/`(\[.*\])`/);const tas=JSON.parse(m[1]);
 const r=emulate(loadLevel(n),tas);const ours=JSON.parse(fs.readFileSync(`results/L${n}.json`));
 rows.push({n,base_claim:+line.split('|')[2],base_replay:r.finished&&!r.dead?r.ticks:('FAIL '+JSON.stringify({f:r.finished,d:r.dead})),ours:ours.frames,bjumps:r.jumped});
 console.log(n,line.split('|')[2].trim(),r.finished,r.dead,r.ticks,'ours',ours.frames);}
fs.writeFileSync('work/cmp/rows.json',JSON.stringify(rows));
