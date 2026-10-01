node -e "
const r=JSON.parse(require('fs').readFileSync('$1','utf8'));const N=+process.env.N;const {toTas,emulate}=require('./tas');const {loadLevel}=require('./boxel');const tas=toTas(r.jumps);const e=emulate(loadLevel(N),tas);const f='../../../results/L'+N+'.json';let cur=1e9;try{cur=require(f).frames}catch(x){}console.log(e.ticks,e.finished,cur);
if(e.finished&&e.ticks<cur)require('fs').writeFileSync(f,JSON.stringify({level:N,frames:e.ticks,jumps:r.jumps,tas,by:'B'}))"
