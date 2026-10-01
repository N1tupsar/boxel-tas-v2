const {Sim,loadLevel}=require('./boxel');const L=loadLevel(22);const fs=require('fs');
const arr=JSON.parse(fs.readFileSync(process.argv[2]));
function run(J,lim){const s=new Sim(L);while(s.tick<lim&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished&&!s.dead?s.finishTick+1:1e9}
let best=1e9,bj=null;
for(const c of arr){let b=1e9,bt=-1,b2=null;
 for(let t=c.t;t<=140;t++){for(let u=0;u<=0;u++){const J=new Set(c.jumps);J.add(t);const v=run(J,200);if(v<b){b=v;bt=t;b2=[...J].sort((a,b)=>a-b)}}}
 console.log(c.est,c.mv,'->',b,bt);if(b<best){best=b;bj=b2}}
console.log(best,JSON.stringify(bj));
