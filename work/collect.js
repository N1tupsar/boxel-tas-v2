const fs=require('fs');const path='/home/user/boxel-tas-v2/';
const cfg={20:'L20',21:'L21',3:null,11:'L11',12:'L12',13:'L13',23:'L23',24:'L24',26:'L26',29:'L29',6:'L6'};
const targets={20:390,21:468,3:321,6:233,11:180,12:240,13:270,23:330,24:180,26:546,29:540};
const rows=[];
for(const n of [3,6,11,12,13,20,21,23,24,26,29]){
  let J;
  if(n==3||n==29||n==11){J=JSON.parse(fs.readFileSync(path+'results/L'+n+'.json')).jumps}
  else{J=require(path+'work/L'+n+'/sim/best.json')[n]}
  const t=require(path+'work/L3/sim/tas');const {loadLevel}=require(path+'work/L3/sim/boxel');
  const a=t.toTas(J);const e=t.emulate(loadLevel(n),a);
  if(!e.finished){console.log(n,'NOT FINISHED');continue}
  fs.writeFileSync(path+'results/L'+n+'.json',JSON.stringify({level:n,frames:e.ticks,jumps:J,tas:a,by:'A'}));
  rows.push({n,frames:e.ticks,target:targets[n],tas:a});
}
let md='# Results\n\n| Level | Frames | Seconds | Target frames | Met? | loadInputs |\n|---|---|---|---|---|---|\n';
for(const r of rows)md+=`| ${r.n} | ${r.frames} | ${(r.frames/60).toFixed(3)} | ${r.target} | ${r.frames<=r.target?'yes':'no'} | \`${JSON.stringify(r.tas)}\` |\n`;
fs.writeFileSync(path+'results/RESULTS.md',md);
console.log(rows.map(r=>r.n+':'+r.frames).join(' '));
