// node refine.js LEVEL SECONDS [seed]  (reads best.json[LEVEL], writes it back if improved)
const {refine,replay}=require('./search2');const {loadLevel}=require('./boxel');const fs=require('fs');
const n=+process.argv[2],T=+process.argv[3]*1000,seed=+(process.argv[4]||3);const L=loadLevel(n);
const b=JSON.parse(fs.readFileSync('best.json'));const j0=b[n];const t0=replay(L,j0);
const r=refine(L,j0,{timeLimitMs:T,robust:false,seed});const rj=r.jumps;const t1=replay(L,rj);
console.log(n,t0,'->',t1,JSON.stringify(rj));
if(t1<t0){b[n]=rj;fs.writeFileSync('best.json',JSON.stringify(b))}
