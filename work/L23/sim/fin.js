const {toTas,emulate}=require('./tas');const {loadLevel}=require('./boxel');const fs=require('fs');
const j=JSON.parse(process.argv[2]);const t=toTas(j);const r=emulate(loadLevel(23),t);console.log(r.ticks,r.finished);
let old=1e9;try{old=JSON.parse(fs.readFileSync('../../../results/L23.json')).frames}catch(e){}
if(r.finished&&r.ticks<old){fs.writeFileSync('../../../results/L23.json',JSON.stringify({level:23,frames:r.ticks,jumps:j,tas:t,by:'B'}));console.log('saved')}
