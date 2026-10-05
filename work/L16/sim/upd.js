const fs=require('fs');let best=null;
for(const f of fs.readdirSync('.').filter(f=>/^sw\d*\.txt$/.test(f)))
 for(const l of fs.readFileSync(f,'utf8').split('\n')){try{const r=JSON.parse(l);if(r.ticks&&(!best||r.ticks<best.ticks))best=r;}catch(e){}}
const cur=require('./best.json')['16'];
const {Sim,loadLevel}=require('./boxel');const L=loadLevel(16);
function rep(j){const J=new Set(j);const s=new Sim(L);while(s.tick<1000&&!s.finished&&!s.dead)s.step({jump:J.has(s.tick)});return s.finished?s.finishTick+1:Infinity;}
console.log('cur',rep(cur),'best',best&&best.ticks,best&&rep(best.jumps));
if(best&&rep(best.jumps)<rep(cur)){fs.writeFileSync('best.json',JSON.stringify({16:best.jumps}));console.log('updated',JSON.stringify(best.jumps));}
