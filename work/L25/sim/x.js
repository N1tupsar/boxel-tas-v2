const {Sim,loadLevel}=require('./boxel');const L=loadLevel(25);
function run(J){const S=new Set(J);const s=new Sim(L);while(s.tick<300&&!s.finished&&!s.dead)s.step({jump:S.has(s.tick)});return s.finished?s.finishTick+1:'x'+(s.dead||'');}
for(const J of [[0,5,8,9,11,13],[1,7,9,10,13,15]])console.log(JSON.stringify(J),run(J));
