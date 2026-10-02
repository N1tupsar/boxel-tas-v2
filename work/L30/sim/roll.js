const {execFileSync}=require('child_process');
let pre=JSON.parse(process.env.START||'[]'),T0=+(process.env.T00||0);const H=+(process.env.H||60),CM=+(process.env.CM||30),C=process.env.C||'60',W=process.env.W||'800';
for(let i=0;i<40;i++){
 const out=execFileSync('node',['cb.js'],{env:{...process.env,PREJ:JSON.stringify(pre),T0:String(T0),TEND:String(T0+H),W,C},maxBuffer:1<<26}).toString().trim();
 const r=JSON.parse(out);
 if(r.dead){console.log("DEAD at",T0);break}
 if(r.fin){console.log('FIN',r.fin,JSON.stringify(r.jumps));break}
 const jj=r.jumps;T0+=CM;pre=jj.filter(t=>t<T0);
 console.log('T0',T0,'x',r.x.toFixed(0),'vx',r.vx.toFixed(2),'at',r.t,JSON.stringify(pre));
}
