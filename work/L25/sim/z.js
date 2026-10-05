const {Sim,loadLevel}=require('./boxel');const L=loadLevel(25);
function emu(arr){const j0=arr[0]==='j0';const t=arr.slice(j0?1:0);const s=new Sim(L);let p=j0;while(s.tick<400&&!s.finished&&!s.dead){s.step({jump:p});p=false;for(let i=0;i<4;i++){if(!t.length)break;const n=t[0];if(typeof n==='number'){if(n===0){t.shift();continue}t[0]--;break}t.shift();if(n==='j')p=true}}return s.finished?s.finishTick+1:'x'}
for(const a of [["j",6,"j",2,"j",1,"j",3,"j",2,"j"],["j0",4,"j",3,"j",1,"j",2,"j",2,"j"],["j0",14,"j",49,"j",11,"j",15,"j"]]) console.log(JSON.stringify(a),emu(a));
