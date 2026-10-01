const {Sim,loadLevel}=require('./sim/boxel');const fs=require('fs');
const out=[];
for(let n=1;n<=30;n++){if(n==17)continue;
  let L;try{L=loadLevel(n)}catch(e){continue}
  const s=new Sim(L);
  const walls=[];
  for(const o of s.objects){ if(o.cls==='player'||o.cls==='finish')continue; const b=o.body; if(!b.isStatic) continue;
    const parts=b.parts.length>1?b.parts.slice(1):[b];
    for(const p of parts){ if(p.isSensor)continue; const v=p.vertices; if(v.length<3)continue;
      // min width over edge normals
      let minW=1e9;for(let i=0;i<v.length;i++){const a=v[i],c=v[(i+1)%v.length];const ex=c.x-a.x,ey=c.y-a.y;const l=Math.hypot(ex,ey);if(l<1e-6)continue;const nx=-ey/l,ny=ex/l;let mn=1e9,mx=-1e9;for(const q of v){const d=q.x*nx+q.y*ny;mn=Math.min(mn,d);mx=Math.max(mx,d)}minW=Math.min(minW,mx-mn)}
      if(minW<=20)walls.push({cls:o.cls,x:Math.round(p.position.x),y:Math.round(p.position.y),w:+minW.toFixed(1)});
    }}
  // max speed along stored route
  let vmax=0,vmaxT=0,vmaxPos=null;const rf=`../../results/L${n}.json`;let frames=null;
  if(fs.existsSync(rf)){const J=new Set(JSON.parse(fs.readFileSync(rf)).jumps);const t=JSON.parse(fs.readFileSync(rf));
    const r=new Sim(L,{});let p0=t.start==='p0';
    while(!r.finished&&!r.dead&&r.tick<3000){const b=r.player.body;const sp=Math.hypot(b.velocity.x,b.velocity.y);if(sp>vmax){vmax=sp;vmaxT=r.tick;vmaxPos=[Math.round(b.position.x),Math.round(b.position.y)]}r.step({jump:J.has(r.tick)})}frames=t.frames}
  out.push({n,thin:walls.length,minW:walls.length?Math.min(...walls.map(w=>w.w)):null,vmax:+vmax.toFixed(1),vmaxT,vmaxPos,frames,walls:walls.slice(0,6)});
}
fs.writeFileSync('thin.json',JSON.stringify(out,null,1));
for(const o of out)console.log(o.n,'thin',o.thin,'minW',o.minW,'vmax',o.vmax,'@',o.vmaxT,JSON.stringify(o.vmaxPos),'frames',o.frames);
