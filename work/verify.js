// usage: node work/verify.js  -> re-emulates every results/L*.json from a fresh (snapped) sim; flags mismatch/dead
const fs=require('fs'),path=require('path');const {emulate}=require('../sim/tas');const {loadLevel}=require('../sim/boxel');
for(const f of fs.readdirSync(path.join(__dirname,'..','results')).filter(f=>/^L\d+\.json$/.test(f)).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)))){
  const j=JSON.parse(fs.readFileSync(path.join(__dirname,'..','results',f)));
  let r;try{r=emulate(loadLevel(j.level),j.tas);}catch(e){r={err:String(e)}}
  const ok=r.finished&&!r.dead&&r.ticks===j.frames&&f===`L${j.level}.json`;
  console.log(ok?'OK  ':'FAIL',f,'claimed',j.frames,'got',r.ticks,'dead',r.dead);}
