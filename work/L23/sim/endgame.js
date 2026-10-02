const {Sim,loadLevel}=require('./boxel');const L=loadLevel(23);
const PJ=JSON.parse(process.argv[2]),T=+process.argv[3];
function fin(extra){const J=new Set([...PJ,...extra]);const s=new Sim(L);while(s.tick<700&&!s.finished&&!s.dead){s.step({jump:J.has(s.tick)})}return s.finished?s.finishTick+1:null}
let best=null;
const base=fin([]);console.log('base',base);
for(let a=T;a<T+110;a++){const f=fin([a]);if(f&&(!best||f<best[0]))best=[f,[a]];
 for(let b=a+1;b<a+40;b++){const g=fin([a,b]);if(g&&(!best||g<best[0]))best=[g,[a,b]];}}
console.log(JSON.stringify(best));
