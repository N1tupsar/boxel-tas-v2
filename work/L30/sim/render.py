import json,sys,subprocess
from PIL import Image, ImageDraw
COL={'cube':(98,4,96),'spike':(220,38,90),'finish':(40,200,90),'player':(255,120,160),'bounce':(2,135,239),'direction':(255,170,0),'gravity':(0,200,220),'resize':(160,90,255),'tip':(120,120,120),'checkpoint':(255,255,255),'grapple':(0,120,255),'control':(255,230,0)}
def render(d,out,scale=1.0,pad=40):
    xs=[v[0] for s in d['shapes'] for p in s['parts'] for v in p['v']]; ys=[v[1] for s in d['shapes'] for p in s['parts'] for v in p['v']]
    if d.get('path'): xs+= [p[0] for p in d['path']['pts']]; ys+=[p[1] for p in d['path']['pts']]
    minx,maxx,miny,maxy=min(xs)-pad,max(xs)+pad,min(ys)-pad,max(ys)+pad
    maxx=min(maxx,minx+6000); maxy=min(maxy,miny+4000)
    W=int((maxx-minx)*scale); H=int((maxy-miny)*scale)
    im=Image.new('RGB',(W,H),(245,243,250)); dr=ImageDraw.Draw(im)
    T=lambda x,y:((x-minx)*scale,(y-miny)*scale)
    for s in d['shapes']:
        for p in s['parts']:
            c=COL.get(s['cls'],(98,4,96))
            pts=[T(*v) for v in p['v']]
            if p['sensor']: dr.polygon(pts,outline=c)
            else: dr.polygon(pts,fill=c if s['cls']!='player' else None, outline=c)
    if d.get('path'):
        pts=[T(*p) for p in d['path']['pts']]
        dr.line(pts,fill=(255,60,60),width=2)
        for i,t in enumerate(d['path']['pts']):
            if i in set(d['path']['jumps']): 
                x,y=T(*t); dr.ellipse([x-4,y-4,x+4,y+4],fill=(0,0,0))
    im.save(out)
    return W,H
if __name__=='__main__':
    n=sys.argv[1]; j=sys.argv[2] if len(sys.argv)>2 else None
    args=['node','dump.js',n]+([j] if j else [])
    d=json.loads(subprocess.check_output(args))
    import os; print(render(d,os.path.join(os.path.dirname(os.path.abspath(__file__)),f'L{n}.png')))
