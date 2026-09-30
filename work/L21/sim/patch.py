s=open('explore2.js').read()
s=s.replace("const grid = buildGrid(root);","const root2 = new Sim(level); { const f=root2.finishObjs[0]; f.setPosition({x:-104,y:0,z:0}); } const grid = buildGrid(root2);")
s=s.replace("const d = Math.hypot(fb.position.x-pb.position.x, fb.position.y-pb.position.y);","const d = grid.at(fb.position.x, fb.position.y) + 0.5*Math.hypot(fb.position.x-pb.position.x, fb.position.y-pb.position.y);")
open('explore2.js','w').write(s)
