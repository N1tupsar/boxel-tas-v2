const {Sim,loadLevel}=require('./boxel');const N=+process.argv[2],T=+process.argv[3];const L=loadLevel(N);
let a=12345;const rnd=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296};
const cells=new Map();
for(let it=0;it<6000;it++){const k=Math.floor(rnd()*6);const js=[];for(let i=0;i<k;i++)js.push(Math.floor(rnd()*T));const J=new Set(js);const s=new Sim(L);let ok=true;for(let t=0;t<T;t++){s.step({jump:J.has(t)});if(s.dead){ok=false;break}}if(!ok)continue;const b=s.player.body;const key=Math.round(b.position.x/100)+','+Math.round(b.position.y/100);if(!cells.has(key))cells.set(key,{n:0,x:b.position.x,y:-b.position.y,vx:b.velocity.x,ex:js});cells.get(key).n++}
for(const [k,v] of [...cells.entries()].sort((p,q)=>q[1].n-p[1].n))console.log(k,v.n,v.x.toFixed(0),v.y.toFixed(0),v.vx.toFixed(1),JSON.stringify(v.ex.sort((p,q)=>p-q)));
