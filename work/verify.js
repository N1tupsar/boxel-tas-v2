// usage: node work/verify.js  -> re-emulates every results/L*.json from a fresh (snapped) sim
const fs=require('fs'),path=require('path');const {emulate}=require('../sim/tas');const {loadLevel}=require('../sim/boxel');
for(const f of fs.readdirSync(path.join(__dirname,'..','results')).filter(f=>/^L\d+\.json$/.test(f))){
  const j=JSON.parse(fs.readFileSync(path.join(__dirname,'..','results',f)));
  let r;try{r=emulate(loadLevel(j.level),j.tas);}catch(e){r=String(e)}
  console.log(f,'claimed',j.frames,'emulated',JSON.stringify(r).slice(0,80));}
