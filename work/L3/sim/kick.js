const {Sim,loadLevel,cloneSim}=require('./boxel');const L=loadLevel(3);
const pre=JSON.parse(process.argv[2]);const T0=+process.argv[3],W=+process.argv[4],XEND=+process.argv[5],D=+process.argv[6]||3;
const J=new Set(pre);const root=new Sim(L);while(root.tick<T0)root.step({jump:J.has(root.tick)});
let best=[];function tryRoll(s,hist){const c=cloneSim(s);for(let k=0;k<200&&!c.dead&&c.player.body.position.x<XEND;k++)c.step({jump:false});if(c.dead||c.player.body.position.x<XEND)return;best.push([c.player.body.velocity.x,c.tick,hist.slice()]);}
function rec(s,t,depth,hist){tryRoll(s,hist);if(depth==0)return;const c=cloneSim(s);for(let u=t;u<=T0+W;u++){if(u>t)c.step({jump:false});if(c.dead||c.player.body.position.x>XEND)break;if(!c.player.jumpReady)continue;const c3=cloneSim(c);c3.step({jump:true});if(c3.dead)continue;rec(c3,u+1,depth-1,[...hist,u]);}}
rec(root,T0,D,[]);best.sort((a,b)=>b[0]-a[0]);console.log(best.length);for(const b of best.slice(0,6))console.log(b[0].toFixed(2),b[1],JSON.stringify(b[2]));
