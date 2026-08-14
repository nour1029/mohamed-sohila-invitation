from PIL import Image
SRC="/Users/noue/.claude/image-cache/3711e7d4-9a36-49e1-bdde-65e08333aa4a/5.png"
im=Image.open(SRC).convert("RGB"); W,H=im.size; px=im.load()
PB=(251.0,238.0,222.0)

def tight_bbox(x0,y0,x1,y1,thr=8):
    bx0,by0,bx1,by1=None,None,None,None
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            c=px[x,y]
            if max(PB[i]-c[i] for i in range(3))>thr:
                if bx0 is None or x<bx0: bx0=x
                if bx1 is None or x>bx1: bx1=x
                if by0 is None: by0=y
                by1=y
    return bx0,by0,bx1,by1

def extract(x0,y0,x1,y1,out,pad=0,floor=6):
    """Un-composite ink laid over the paper: C = A*F + (1-A)*PB."""
    x0=max(0,x0-pad); y0=max(0,y0-pad); x1=min(W-1,x1+pad); y1=min(H-1,y1+pad)
    w,h=x1-x0+1,y1-y0+1
    out_im=Image.new("RGBA",(w,h),(0,0,0,0)); op=out_im.load()
    for yy in range(h):
        for xx in range(w):
            c=px[x0+xx,y0+yy]
            a=max((PB[i]-c[i])/PB[i] for i in range(3))
            if a<=0: continue
            a=min(1.0,a)
            A=round(a*255)
            if A<floor: continue          # kill paper-grain noise
            f=[]
            for i in range(3):
                v=(c[i]-(1-a)*PB[i])/a
                f.append(max(0,min(255,round(v))))
            op[xx,yy]=(f[0],f[1],f[2],A)
    out_im.save(out)
    print(out,"crop=(%d,%d)-(%d,%d)"%(x0,y0,x1,y1),"size=%dx%d"%(w,h))
    return (x0,y0,x1,y1)

b=tight_bbox(100,540,1300,1100); print("building tight bbox",b)
d=tight_bbox(560,265,860,330); print("divider tight bbox",d)
extract(*b,"venue-building.png")
extract(*d,"venue-divider.png")
