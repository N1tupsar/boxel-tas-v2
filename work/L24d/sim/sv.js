const {toTas,emulate}=require('./tas');const {loadLevel}=require('./boxel');const fs=require('fs');
const jumps=JSON.parse(process.argv[2]); const tas=toTas(jumps); const r=emulate(loadLevel(24),tas);
console.log(JSON.stringify({fin:r.finished,ticks:r.ticks}));
const out='../../../results/L24.json'; let cur=null; try{cur=JSON.parse(fs.readFileSync(out))}catch(e){}
if(r.finished&&(!cur||r.ticks<cur.frames)){fs.writeFileSync(out,JSON.stringify({level:24,frames:r.ticks,jumps:r.jumped,tas,by:'A'}));fs.writeFileSync('best.json',JSON.stringify({24:r.jumped}));console.log('saved',r.ticks)}
