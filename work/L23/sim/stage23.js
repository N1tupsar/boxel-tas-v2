const {beam}=require('./search2');const {loadLevel}=require('./boxel');
const r=beam(loadLevel(23),23,{W:+process.argv[2]||1500,timeLimitMs:900000,dumpWp:+process.env.DW||1,maxTicks:700});
console.log(JSON.stringify(r));
