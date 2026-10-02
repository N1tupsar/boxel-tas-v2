const {beam}=require('./search2');const {loadLevel}=require('./boxel');
const W=+process.argv[2]||400;const r=beam(loadLevel(26),26,{W,timeLimitMs:600000,dumpWp:+(process.env.DW||1),maxTicks:900});
console.log(JSON.stringify(r));
