// usage: node noisy.js LEVEL W NOISE SEEDS LA TIME  (run from level sim dir)
const {spawn}=require('child_process');const fs=require('fs');
const [L,W,NOISE,SEEDS,LA,TIME]=process.argv.slice(2);let best=1e9,bj=null,next=1,run=0;const total=+SEEDS;
function launch(){ if(next>total){ if(run==0){console.log('DONE',best);} return;} const seed=next++;run++;
 const p=spawn('node',['search2.js',L,W,'600000'],{env:{...process.env,NOISE,SEED:String(seed*7919),LA,TIME}});let out='';p.stdout.on('data',d=>out+=d);
 p.on('close',()=>{run--;try{const r=JSON.parse(out.trim().split('\n').pop());if(r.ticks&&r.ticks<best){best=r.ticks;bj=r.jumps;fs.writeFileSync('noisy_best_'+L+'.json',JSON.stringify({ticks:best,jumps:bj}));console.log('new best',best,'seed',seed)}}catch(e){}launch()});}
for(let i=0;i<4;i++)launch();
