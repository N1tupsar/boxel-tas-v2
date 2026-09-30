const {Sim,loadLevel}=require('./boxel');const L=loadLevel(24);
function run(js){const J=new Set(js);const s=new Sim(L);for(let t=0;t<300&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished?s.finishTick+1:999;}
const base=[101,180,204,222,240,250];console.log(run(base));
let best=999,bj;
// +-3 all combos on 6 jumps (7^6=117k) plus optional j0
for(const pre of [[],[0]]){
const rec=(i,cur)=>{if(i==6){const v=run([...pre,...cur]);if(v<best){best=v;bj=[...pre,...cur];console.log(v,JSON.stringify(bj))}return}
for(let d=-3;d<=3;d++)rec(i+1,[...cur,base[i]+d])};rec(0,[]);}
console.log('best',best,JSON.stringify(bj));
