const {execFileSync}=require('child_process');
const pres=require('./pres.json');const [a,b,W]=process.argv.slice(2).map(Number);
pres.sort((p,q)=>q.vx*100+q.x-(p.vx*100+p.x));
for(let i=a;i<Math.min(b,pres.length);i++){
 try{const o=execFileSync('node',['pre.js',process.env.HH||'345',String(W),'300'],{env:{...process.env,PRE:JSON.stringify(pres[i].j),T0:process.env.PT||'31'},timeout:300000}).toString().trim().split('\n').slice(0,3).join(' || ');
 console.log(i,pres[i].vx.toFixed(3),o);}catch(e){console.log(i,'fail')}}
