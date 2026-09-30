s=open('gb.js').read()
s=s.replace("return fo*FW - k*SB +","if(fo<(+process.env.CHR||50)){const fv=fb.velocity; return fo*FW + Math.hypot(fb.position.x-b.position.x,fb.position.y-b.position.y)/Math.max(Math.hypot(b.velocity.x-fv.x,b.velocity.y-fv.y),TMIN);} return fo*FW - k*SB +")
open('gb.js','w').write(s)
