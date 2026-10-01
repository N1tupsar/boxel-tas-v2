const {Sim,loadLevel,run}=require('./boxel');const fs=require('fs');
// dump shapes (and optional path) as JSON: node dump.js n [jumps json]
const n=+process.argv[2]; const J=process.argv[3]?JSON.parse(process.argv[3]):null;
const s=new Sim(loadLevel(n));
const shapes=s.objects.filter(o=>o.position.z===0).map(o=>({cls:o.cls, parts:o.body.parts.slice(o.body.parts.length>1?1:0).map(p=>({sensor:!!p.isSensor, v:p.vertices.map(v=>[v.x,v.y])})), rot:o.rotZ, pos:[o.body.position.x,o.body.position.y]}));
let path=null;
if(J){ const r=run(loadLevel(n),J,4000,{trace:true}); path={pts:r.trace.map(t=>[t.x,-t.y]), jumps:J, finished:r.sim.finished, tick:r.sim.finishTick, events:r.sim.events}; }
console.log(JSON.stringify({n,shapes,path}));
