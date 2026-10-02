const { Sim, loadLevel, cloneSim } = require('./boxel');
const CPS=(process.env.CPS||'300,560,700,880,1260,1640,2020,2400,2800').split(',').map(Number);
const N=+(process.env.N||12),IW=+(process.env.IW||200),FX=2784;
const root=new Sim(loadLevel(30));root.hist=null;
const hl=h=>{const o=[];while(h){o.push(h.t);h=h.prev}return o.reverse()};
let frontier=[root];
for(let ci=0;ci<CPS.length;ci++){const cp=CPS[ci];const arrived=[];
 for(const f0 of frontier){
  let beam=[f0];const start=f0.tick;
  for(let t=start;t<start+(+process.env.HZ||140)&&beam.length;t++){const kids=new Map();
   for(const s of beam){const acts=(t>=1&&s.player.jumpReady)?[true,false]:[false];
    for(let k=0;k<acts.length;k++){const c=k==acts.length-1?s:cloneSim(s);c.step({jump:acts[k]});c.hist=acts[k]?{t,prev:s.hist}:s.hist;if(c.dead)continue;
     if(c.finished){if(!global.F||c.finishTick<global.F){global.F=c.finishTick;console.log('FIN',c.finishTick+1,JSON.stringify(hl(c.hist)));}}
     const b=c.player.body;
     if(b.position.x>cp){arrived.push(c);continue}
     c.score=-(b.position.x+Math.max(b.velocity.x,0)*(+process.env.CV||150));
     const key=Math.round(b.position.x/8)+','+[b.position.y,b.velocity.x*3,b.velocity.y*3,b.angle*3].map(Math.round).join(',')+(c.player.jumpReady?1:0);const q=kids.get(key);if(!q||q.score>c.score)kids.set(key,c)}}
   beam=[...kids.values()].sort((a,b)=>a.score-b.score).slice(0,IW)}
 }
 // choose diverse top N by projected finish time
 const proj=s=>{const b=s.player.body;return s.tick+(FX-b.position.x)/Math.max(b.velocity.x,2)};
 arrived.sort((a,b)=>proj(a)-proj(b));
 const groups=new Map();const pick=[];
 for(const s of arrived){const b=s.player.body;const g=Math.floor(((b.angle%1.5708)+1.5708)%1.5708/0.4)+'_'+(b.velocity.y>0?1:0)+'_'+Math.round(b.position.y/20);const n=groups.get(g)||0;if(n<2){groups.set(g,n+1);pick.push(s)}if(pick.length>=N)break}
 frontier=pick;
 console.log('cp',cp,'arrived',arrived.length,'kept',pick.length,'best tick',pick[0].tick,'vx',pick[0].player.body.velocity.x.toFixed(2),'proj',proj(pick[0]).toFixed(0));
}
console.log('END');
