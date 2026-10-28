# Builds the Sports Timeline logo (brand/*.svg) from the Anek Bangla font: shapes the Bangla text with HarfBuzz and
# writes vector paths. Needs: pip install uharfbuzz fonttools brotli. Then run node-free: python3 tools/genlogo.py
# and regenerate js/brand.js with: python3 tools/genlogo.py --js
import io, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
F=os.path.join(ROOT,'fonts')+'/'
_c={}
def font(name, axes):
    k=(name,str(axes))
    if k not in _c:
        f=TTFont(F+name); f=instancer.instantiateVariableFont(f,axes) if axes else f; f.flavor=None
        b=io.BytesIO(); f.save(b); d=b.getvalue(); _c[k]=(TTFont(io.BytesIO(d)),d)
    return _c[k]
def shape(text,size,name='AnekBangla-normal-100-800-bengali.woff2',axes={'wght':800,'wdth':100},track=0):
    tt,data=font(name,axes); face=hb.Face(data); f=hb.Font(face); sc=size/face.upem
    buf=hb.Buffer(); buf.add_str(text); buf.guess_segment_properties(); hb.shape(f,buf,{})
    gs=tt.getGlyphSet(); order=tt.getGlyphOrder(); x=0; ds=[]; bp=BoundsPen(gs)
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        g=order[info.codepoint]; m=(sc,0,0,-sc,(x+pos.x_offset)*sc,-pos.y_offset*sc)
        p=SVGPathPen(gs); gs[g].draw(TransformPen(p,m)); gs[g].draw(TransformPen(bp,m))
        if p.getCommands(): ds.append(p.getCommands())
        x+=pos.x_advance + (track/sc if pos.x_advance else 0)
    return ' '.join(ds), bp.bounds  # bounds: xmin,ymin,xmax,ymax (y down)
A='var(--logo-a,#FBF3E6)'; B='var(--logo-b,#E0A030)'
SK=-9  # italic lean, for motion
T=0.158
def line(d,b,x,y,fill,s=1):
    # glyph run placed with its box top-left at (x,y), leaning about its own baseline
    h=(b[3]-b[1])*s
    return f'<g transform="translate({x+h*T:.1f},{y+h:.1f}) skewX({SK}) translate(0,{-h:.1f}) scale({s})"><path fill="{fill}" d="{d}" transform="translate({-b[0]},{-b[1]})"/></g>'
def track(W,y,n,r=15,R=22,A=A,B=B):
    g=f'<rect x="0" y="{y-5}" width="{W-R-40}" height="10" rx="5" fill="{B}"/>'
    for i in range(n): g+=f'<circle cx="{W*(0.14+0.26*i)}" cy="{y}" r="{r}" fill="{A}"/>'
    return g+f'<circle cx="{W-R-8}" cy="{y}" r="{R}" fill="none" stroke="{B}" stroke-width="10"/><circle cx="{W-R-8}" cy="{y}" r="{R*0.4}" fill="{A}"/>'
def stackedG(A=A,B=B):
    d1,b1=shape('স্পোর্টস',220); d2,b2=shape('টাইমলাইন',220)
    w1=b1[2]-b1[0]; w2=b2[2]-b2[0]; s2=w1/w2; h1=b1[3]-b1[1]; h2=(b2[3]-b2[1])*s2
    y2=h1+26; yb=y2+h2+44
    W=w1+h1*T
    g=line(d1,b1,0,0,A)+line(d2,b2,0,y2,B,s2)+track(W,yb,2,A=A,B=B)
    return g,W,yb+30
def stacked():
    g,W,H=stackedG(); p=40
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-p} {-p} {W+2*p:.0f} {H+2*p:.0f}">{g}</svg>'
def wide():
    d1,b1=shape('স্পোর্টস',200); d2,b2=shape('টাইমলাইন',200)
    top=min(b1[1],b2[1]); bot=max(b1[3],b2[3]); H=bot-top
    bb1=(b1[0],top,b1[2],bot); bb2=(b2[0],top,b2[2],bot)
    x2=b1[2]-b1[0]+46; W=x2+b2[2]-b2[0]+H*T
    g=line(d1,bb1,0,0,A)+line(d2,bb2,x2,0,B)+track(W,H+40,3,14,21)
    p=30
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-p} {-p} {W+2*p:.0f} {H+70+2*p:.0f}">{g}</svg>'
def icon():
    g,W,H=stackedG(); S=500; c=S/2; sc=330/W
    out=f'<circle cx="{c}" cy="{c}" r="{c-6}" fill="var(--logo-bg,#1E3F2E)" stroke="{B}" stroke-width="12"/>'
    out+=f'<g transform="translate({c-W*sc/2:.1f},{c-H*sc/2:.1f}) scale({sc:.4f})">{g}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}">{out}</svg>'
import os
os.makedirs(os.path.join(ROOT,'brand'),exist_ok=True)
for n,f in [('logo-stacked',stacked),('logo-wide',wide),('logo-icon',icon)]:
    open(os.path.join(ROOT,'brand',n+'.svg'),'w').write(f())
import sys, json
if '--js' in sys.argv:
    d = {k: open(os.path.join(ROOT, 'brand', f'logo-{k}.svg')).read() for k in ['stacked', 'wide', 'icon']}
    open(os.path.join(ROOT, 'js', 'brand.js'), 'w').write('/* Sports Timeline logo (generated from brand/*.svg). Colours come from CSS: --logo-a (main), --logo-b (accent), --logo-bg (icon disc). */\nwindow.ST_BRAND = ' + json.dumps(d, ensure_ascii=False) + ';\n')
