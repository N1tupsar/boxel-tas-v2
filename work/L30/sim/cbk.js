// custom beam: PREJ prefix before T0, then beam maximizing x + C*vx (+Cy*y) until TEND. env: PREJ T0 TEND W C
const { Sim, loadLevel, cloneSim } = require('./boxel');
const L=30;const PJ=JSON.parse(process.env.PREJ||'[]');const T0=+process.env.T0,TEND=+process.env.TEND,W=+process.env.W||500,C=+(process.env.C||0);
const CY=+(process.env.CY||0);
const root=new Sim(loadLevel(L));const J=new Set(PJ.filter(t=>t<T0));
while(root.tick<T0)root.step({jump:J.has(root.tick)});
root.hist=PJ.filter(t=>t<T0);
let beam=[root];
const key=s=>{const b=s.player.body;return [Math.round(b.position.x*2),Math.round(b.position.y*2),Math.round(b.velocity.x*8),Math.round(b.velocity.y*8),Math.round(((b.angle%(Math.PI/2))+Math.PI/2)%(Math.PI/2)*20),Math.round(b.angularVelocity*100),s.player.jumpReady?1:0].join(',')};
const PTS=[[800,144],[864,144],[1056,176],[1248,208],[1440,240],[1632,272],[1824,304],[2016,336],[2208,376],[2400,408],[2592,440],[2784,480],[3000,520]];
const yL=x=>{for(let i=1;i<PTS.length;i++)if(x<=PTS[i][0]){const a=PTS[i-1],b=PTS[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])}return 520};
const PEN=+(process.env.PEN||0),TOL=+(process.env.TOL||30);
const sc=s=>{const b=s.player.body;const y=-b.position.y;const lag=Math.max(0,yL(b.position.x)-8-TOL-y);return -(b.position.x+C*(b.velocity.x+(+process.env.K)*Math.abs(b.angularVelocity)))};
let fin=null;
for(let t=T0;t<TEND;t++){
 const kids=new Map();
 for(const s of beam){
  const canJ=t>=1&&s.player.mode==='jump'&&s.player.jumpReady;
  for(const a of canJ?[true,false]:[false]){
   const c=a===(canJ?false:false)&&!canJ?s:cloneSim(s);
   if(!c.hist)c.hist=s.hist;
   c.step({jump:a});c.hist=a?s.hist.concat([t]):s.hist;
   if(c.finished){if(!fin||c.finishTick<fin.t)fin={t:c.finishTick+1,j:c.hist};continue}
   if(c.dead)continue;c.score=sc(c);
   const k=key(c);const p=kids.get(k);if(!p||p.score>c.score)kids.set(k,c);
  }
 }
 if(fin)break;
 beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,W);
}
if(fin){console.log(JSON.stringify({fin:fin.t,jumps:fin.j}));process.exit()}
if(!beam.length){console.log(JSON.stringify({dead:1}));process.exit()}
const b=beam[0].player.body;
console.log(JSON.stringify({t:TEND,w:beam[0].player.body.angularVelocity,x:b.position.x,y:b.position.y,vx:b.velocity.x,vy:b.velocity.y,jumps:beam[0].hist}));
