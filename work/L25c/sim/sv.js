const {toTas,emulate}=require('./tas');const {loadLevel}=require('./boxel');const fs=require('fs');
process.env.PRETOUCH='1';
const jumps=JSON.parse(process.argv[2]);const tas=toTas(jumps,{p0:true});const r=emulate(loadLevel(25),tas);
console.log(r.finished,r.ticks);const out='../../../results/L25.json';const cur=JSON.parse(fs.readFileSync(out));
if(r.finished&&r.ticks<cur.frames){fs.writeFileSync(out,JSON.stringify({level:25,frames:r.ticks,jumps:r.jumped,tas,start:'p0',by:"A"}));console.log('saved')}
