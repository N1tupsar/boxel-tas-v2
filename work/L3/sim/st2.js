const {Sim,loadLevel,cloneSim}=require('./boxel');const L=loadLevel(3);
const pre=[0,15,22,25,26];const J=new Set(pre);const root=new Sim(L);while(root.tick<27)root.step({jump:J.has(root.tick)});
function stage(start,t0,W,XEND,D,cb){const found=[];(function rec(s,t,depth,hist){
 // rollout without jump until x>=XEND
 const c=cloneSim(s);for(let k=0;k<300&&!c.dead&&c.player.body.position.x<XEND;k++)c.step({jump:false});
 if(!c.dead&&c.player.body.position.x>=XEND)found.push({s:c,hist});
 if(depth==0)return;const d=cloneSim(s);for(let u=t;u<=t0+W;u++){if(u>t)d.step({jump:false});if(d.dead||d.player.body.position.x>XEND)break;if(!d.player.jumpReady)continue;const e=cloneSim(d);e.step({jump:true});if(e.dead)continue;rec(e,u+1,depth-1,[...hist,u]);}})(start,t0,D,[]);return found}
const s1=stage(root,27,80,230,3);console.log('stage1 states',s1.length);
const uniq=new Map();for(const f of s1){const b=f.s.player.body;const k=[b.velocity.x.toFixed(1),b.angularVelocity.toFixed(2),b.position.y.toFixed(0),f.s.tick].join();if(!uniq.has(k))uniq.set(k,f)}
const arr=[...uniq.values()].sort((a,b)=>b.s.player.body.velocity.x-a.s.player.body.velocity.x).slice(0,150);console.log('uniq',uniq.size,'top vx',arr[0].s.player.body.velocity.x.toFixed(2));
let best=0;
for(const f of arr){const st=f.s;// state at x>=230 after rollout; but we want stage 2 starting before pillar 424: start from state at t of last jump? use rollout state (x>=230)
 const s2=stage(st,st.tick,150,520,2);for(const g of s2){const v=g.s.player.body.velocity.x;if(v>best){best=v;console.log(v.toFixed(2),g.s.tick,JSON.stringify([...pre,...f.hist,...g.hist]))}}}
