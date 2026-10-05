const {Sim,loadLevel}=require('./boxel');const L=loadLevel(25);
function run(J,max=300){const S=new Set(J);const s=new Sim(L);while(s.tick<max&&!s.finished&&!s.dead)s.step({jump:S.has(s.tick)});return s.finished?s.finishTick+1:(s.dead||'x');}
let res=[];
for(let a=0;a<=3;a++)for(let b=a+1;b<=70;b++)for(let c=b+1;c<=70;c++){const r=run([a,b,c]);if(typeof r==='number')res.push([r,a,b,c]);}
for(let a=0;a<=40;a++)for(let b=a+1;b<=40;b++){const r=run([a,b]);if(typeof r==='number')res.push([r,a,b]);}
for(let a=0;a<=100;a++){const r=run([a]);if(typeof r==='number')res.push([r,a]);}
res.sort((x,y)=>x[0]-y[0]);console.log(res.slice(0,8).map(x=>x.join(',')).join(' | '));
const s=new Sim(L);s.step({jump:true});const b=s.player.body;for(let i=1;i<=30;i++){s.step({});if(i%3==0)console.log(i,b.position.x.toFixed(1),(-b.position.y).toFixed(1),b.velocity.x.toFixed(2),(-b.velocity.y).toFixed(2),s.player.jumpReady,JSON.stringify(s.events.slice(-1)));}
