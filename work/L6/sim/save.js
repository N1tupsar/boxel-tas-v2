const {toTas,emulate}=require('./tas');const {loadLevel,run}=require('./boxel');
const J=JSON.parse(process.argv[2]);const tas=toTas(J);
const r=emulate(loadLevel(6),tas);console.log(JSON.stringify(r).slice(0,200));console.log(JSON.stringify(tas));
const s=run(loadLevel(6),J,800).sim;console.log('sim',s.finished,s.finishTick+1);
