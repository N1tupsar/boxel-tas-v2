node -e "
const r=JSON.parse(require('fs').readFileSync('$1','utf8'));const {toTas,emulate}=require('./tas');const {loadLevel}=require('./boxel');const tas=toTas(r.jumps);const e=emulate(loadLevel(10),tas);const cur=require('../../../results/L10.json').frames;console.log(e.ticks,e.finished,cur);
if(e.finished&&e.ticks<cur)require('fs').writeFileSync('../../../results/L10.json',JSON.stringify({level:9,frames:e.ticks,jumps:r.jumps,tas,by:'B'}))"
