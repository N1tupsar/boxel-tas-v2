const {Sim,loadLevel}=require('./boxel');
const G=[[1,0],[0,-1],[-1,0],[0,1]]; // R,U,L,D (matter coords)
function run(durs,startIdx=0,verbose){
  const s=new Sim(loadLevel(21)); s.player.body.collisionFilter.mask=0; Matter=require('matter-js'); Matter.Body.setPosition(s.player.body,{x:-8,y:-400});Matter.Body.setStatic(s.player.body,true);
  const f=s.finishObjs[0].body; let t=0; const tr=[];
  for(let i=0;i<durs.length;i++){const g=G[(i+startIdx)%4]; s.engine.gravity.x=g[0];s.engine.gravity.y=g[1];
    for(let k=0;k<durs[i];k++){s.step({});t++;} if(verbose)console.log(i,'g',g,'t',t,'fin',f.position.x.toFixed(0),(-f.position.y).toFixed(0));}
  return {x:f.position.x,y:-f.position.y};
}
module.exports={run};
if(require.main===module){run(Array(12).fill(+process.argv[2]||60),0,true)}
