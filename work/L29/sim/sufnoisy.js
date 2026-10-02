// node sufnoisy.js LEVEL T0 W TMIN NOISE SEEDS
const {spawn}=require('child_process');const fs=require('fs');
const [L,T0,W,TMIN,NOISE,SEEDS]=process.argv.slice(2);let best=1e9,next=1,run=0;const total=+SEEDS;
function launch(){ if(next>total){ if(run==0)console.log('DONE',best); return;} const seed=next++;run++;
 const p=spawn('node',['suffix.js',L,T0,W,TMIN],{env:{...process.env,NOISE,SEED:String(seed*7919)}});let out='';p.stdout.on('data',d=>out+=d);
 p.on('close',()=>{run--;try{const r=JSON.parse(out.trim().split('\n').pop());if(r.ticks&&r.ticks<best){best=r.ticks;fs.writeFileSync('suf_best_'+L+'_'+T0+'.json',JSON.stringify(r));console.log('new best',best,'seed',seed)}}catch(e){}launch()});}
for(let i=0;i<4;i++)launch();
