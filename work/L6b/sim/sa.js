const {Sim,loadLevel}=require('./boxel');const N=+process.argv[2],seed=+process.argv[3],MS=+process.argv[4],MAXT=+process.argv[5],TEMP=+(process.argv[6]||0.6);const L=loadLevel(N);
let a=seed*2654435761>>>0;const rnd=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296};
function run(js,lim){const J=new Set(js);const s=new Sim(L);for(let t=0;t<lim&&!s.finished&&!s.dead;t++)s.step({jump:J.has(t)});return s.finished&&!s.dead?s.finishTick+1:99999;}
const f='../../../results/L'+N+'.json';let base=[...require(f).jumps];let cur=run(base,MAXT),best=cur,bestJ=[...base];const t0=Date.now();let it=0,lastImp=Date.now();
while(Date.now()-t0<MS){it++;const c=[...cur===99999?bestJ:base];const k=1+Math.floor(rnd()*4);
 for(let m=0;m<k;m++){const r=rnd();const i=Math.floor(rnd()*c.length);
  if(r<0.45)c[i]+=(rnd()<0.5?-1:1)*(1+Math.floor(rnd()*5));
  else if(r<0.55&&c.length>2)c.splice(i,1);
  else if(r<0.7)c.splice(i,0,c[i]+Math.floor(rnd()*9)-4);
  else if(r<0.8){const j=Math.floor(rnd()*c.length);const x=c[i];c[i]=c[j];c[j]=x+Math.floor(rnd()*3)-1}
  else if(r<0.9){const u=c[i]+Math.floor(rnd()*7)-3;c.splice(i,0,u,u+1+Math.floor(rnd()*4))}
  else if(r<0.95){c[i]+=Math.floor(rnd()*21)-10}
  else {if(c[0]===0)c.shift();else c.unshift(0)}}
 const u=[...new Set(c.filter(x=>x>=0))].sort((x,y)=>x-y);const v=run(u,Math.min(MAXT,best+TEMP*6+4));
 if(v<99999&&(v<=cur||rnd()<Math.exp(-(v-cur)/TEMP))){base=u;cur=v;if(v<best){best=v;bestJ=[...u];console.log(it,v,JSON.stringify(u));lastImp=Date.now()}}
 if(Date.now()-lastImp>120000){base=[...bestJ];cur=best;lastImp=Date.now()}}
console.log('final',best,it,JSON.stringify(bestJ));
