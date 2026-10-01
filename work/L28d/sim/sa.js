// sa.js level seed iters [startjson]  : randomized local search with prefix checkpoints; writes results/LN.json (+tas) only if strictly better via sv logic
const {Sim,loadLevel,cloneSim}=require('./boxel');const {toTas,emulate}=require('./tas');const fs=require('fs');
const n=+process.argv[2];let seed=+process.argv[3]||1;const iters=+process.argv[4]||50000;const L=loadLevel(n);
const out=`../../../results/L${n}.json`;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
let cur=process.argv[5]?JSON.parse(process.argv[5]):JSON.parse(fs.readFileSync(out)).jumps;
const STEP=6;
function evalFull(J,lim){const S=new Set(J);const s=new Sim(L);const cps=[];while(s.tick<lim&&!s.finished&&!s.dead){if(s.tick%STEP===0)cps[s.tick/STEP]=cloneSim(s);s.step({jump:S.has(s.tick)});}return {v:s.finished&&!s.dead?s.finishTick+1:1e9,cps}}
let ev=evalFull(cur,3000);let curV=ev.v,cps=ev.cps;let bestV=curV,bestJ=[...cur];console.log('start',curV);
const T0=Date.now();
function trySave(J,v){try{const curF=JSON.parse(fs.readFileSync(out)).frames;if(v<curF){const t=toTas(J);const r=emulate(L,t);if(r.finished&&!r.dead&&r.ticks<curF){fs.writeFileSync(out,JSON.stringify({level:n,frames:r.ticks,jumps:r.jumped,tas:t,by:'A'}));fs.writeFileSync('best.json',JSON.stringify({[n]:r.jumped}));console.log('SAVED',r.ticks)}}}catch(e){}}
function evalFrom(J,tc,lim){const S=new Set(J);const idx=Math.max(0,Math.min(Math.floor(tc/STEP),cps.length-1));const s=cloneSim(cps[idx]);while(s.tick<lim&&!s.finished&&!s.dead)s.step({jump:S.has(s.tick)});return s.finished&&!s.dead?s.finishTick+1:1e9}
for(let it=0;it<iters;it++){
 const c=[...cur];let tc=1e9;const m=1+Math.floor(rnd()*3);
 for(let k=0;k<m;k++){const r=rnd();
  if(r<0.55&&c.length){const i=Math.floor(rnd()*c.length);const d=Math.round((rnd()-0.5)*8)||1;tc=Math.min(tc,c[i],c[i]+d);c[i]=Math.max(0,c[i]+d)}
  else if(r<0.7&&c.length){const i=Math.floor(rnd()*c.length);tc=Math.min(tc,c[i]);c.splice(i,1)}
  else if(r<0.85){const t=Math.floor(rnd()*Math.min(curV,400));tc=Math.min(tc,t);c.push(t)}
  else if(c.length>1){const i=Math.floor(rnd()*(c.length-1));const d=Math.round((rnd()-0.5)*6)||1;tc=Math.min(tc,c[i]);for(let j=i;j<c.length;j++){tc=Math.min(tc,c[j]);c[j]=Math.max(0,c[j]+d)}}}
 const u=[...new Set(c)].sort((a,b)=>a-b);if(tc>=1e9)continue;
 const v=evalFrom(u,tc,curV+4);
 if(v<=curV){const same=v===curV;cur=u;curV=v;if(v<curV+1&&!same||true){ev=evalFull(cur,curV+10);cps=ev.cps}
  if(v<bestV){bestV=v;bestJ=[...u];trySave(bestJ,v);console.log('best',v,JSON.stringify(u),((Date.now()-T0)/1000).toFixed(0)+'s')}}
 else if(rnd()<0.002){/* occasional restart from best */cur=[...bestJ];ev=evalFull(cur,bestV+10);curV=ev.v;cps=ev.cps}
}
console.log(JSON.stringify({bestV,bestJ}));
if(bestV<JSON.parse(fs.readFileSync(out)).frames){const t=toTas(bestJ);const r=emulate(L,t);if(r.finished&&!r.dead&&r.ticks<JSON.parse(fs.readFileSync(out)).frames){fs.writeFileSync(out,JSON.stringify({level:n,frames:r.ticks,jumps:r.jumped,tas:t,by:'A'}));console.log('SAVED',r.ticks)}}
