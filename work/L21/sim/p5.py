s=open('gb.js').read()
s=s.replace("let beam=[root]; let best=null;\nfor(let t=0;","""const T0=+process.env.T0||0; const PJ=new Set(process.env.T0?require('../../../results/L21.json').jumps.filter(t=>t<T0):[]);
for(let t=0;t<T0;t++){const g0=root.engine.gravity.x+','+root.engine.gravity.y; root.step({jump:PJ.has(t)}); if(PJ.has(t))root.hist={t,prev:root.hist}; const g1=root.engine.gravity.x+','+root.engine.gravity.y; if(g0!==g1)root.stage++;}
let beam=[root]; let best=null;
for(let t=T0;""")
open('gb.js','w').write(s)
