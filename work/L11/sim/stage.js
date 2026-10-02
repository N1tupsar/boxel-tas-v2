const {beam}=require('./search2');const {loadLevel}=require('./boxel');
const W=+process.argv[2]||400;const r=beam(loadLevel(+process.env.L),+process.env.L,{W,timeLimitMs:600000,dumpWp:1,maxTicks:900});
console.log(JSON.stringify(r));
