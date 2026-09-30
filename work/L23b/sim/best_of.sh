node -e "
const fs=require('fs');let b=null;for(const f of fs.readdirSync('.').filter(x=>/^sw\d+\.log$/.test(x)))for(const l of fs.readFileSync(f,'utf8').split('\n')){try{const r=JSON.parse(l);if(r.ticks&&(!b||r.ticks<b.ticks))b=r}catch(e){}}
console.log(b.ticks,b.T0);console.log(JSON.stringify(b.jumps))"
