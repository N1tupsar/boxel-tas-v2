const {Sim,loadLevel}=require('./boxel');const L=loadLevel(23);
const PJ=JSON.parse(process.argv[2]),T=+process.argv[3];
function run(extra){const J=new Set([...PJ,...extra]);const s=new Sim(L);let md=1e9,mt=0;while(s.tick<T+160&&!s.finished&&!s.dead){s.step({jump:J.has(s.tick)});const b=s.player.body;const d=Math.hypot(b.position.x+304,-b.position.y-240);if(d<md){md=d;mt=s.tick}}return [s.finished?s.finishTick+1:null,md,mt]}
let best=[null,1e9];
for(let a=T;a<T+90;a++){const r=run([a]);if(r[0]){console.log('FIN',r[0],a);}if(r[1]<best[1])best=[a,r[1],r[2]]}
console.log('closest single jump',JSON.stringify(best));
