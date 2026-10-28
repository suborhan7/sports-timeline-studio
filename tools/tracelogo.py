"""Trace the page's original logo (brand/original-logo.png) into recolourable SVG and write js/brand.js.

The cream word becomes --logo-a, the gold word and the two swooshes --logo-b, so the studio can show the original
lettering in white, gold, black and so on. Needs: pip install potracer pillow numpy
    python3 tools/tracelogo.py
"""
import json, os
import numpy as np
from PIL import Image
import potrace

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'brand', 'original-logo.png')
A, B = 'var(--logo-a,#FBF3E6)', 'var(--logo-b,#E0A030)'

img = Image.open(SRC).convert('RGB')
S = 1200 / img.width
img = img.resize((round(img.width * S), round(img.height * S)), Image.LANCZOS)
a = np.asarray(img).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
cream = (r > 170) & (g > 160) & (b > 140) & (abs(r - b) < 90)
gold = (r > 120) & (r - b > 60) & (g > 70) & ~cream


def trace(mask):
    """-> list of (bbox, path d) per closed curve, in source pixels (potracer traces the False pixels, hence ~mask)"""
    out = []
    for c in potrace.Bitmap(~mask).trace(turdsize=12, alphamax=1.0, opticurve=True, opttolerance=0.2):
        x0, y0 = c.start_point.x, c.start_point.y
        d, xs, ys = [f'M{x0:.1f} {y0:.1f}'], [x0], [y0]
        for s in c.segments:
            if s.is_corner:
                d.append(f'L{s.c.x:.1f} {s.c.y:.1f}L{s.end_point.x:.1f} {s.end_point.y:.1f}')
                xs += [s.c.x, s.end_point.x]; ys += [s.c.y, s.end_point.y]
            else:
                d.append(f'C{s.c1.x:.1f} {s.c1.y:.1f} {s.c2.x:.1f} {s.c2.y:.1f} {s.end_point.x:.1f} {s.end_point.y:.1f}')
                xs += [s.c1.x, s.c2.x, s.end_point.x]; ys += [s.c1.y, s.c2.y, s.end_point.y]
        out.append(((min(xs), min(ys), max(xs), max(ys)), ''.join(d) + 'Z'))
    return out


top = trace(cream)
gold_all = trace(gold)
W0 = max(bb[2] for bb, _ in gold_all) - min(bb[0] for bb, _ in gold_all)
# the swooshes are long thin arcs; everything else gold is the second word
swoosh = [p for p in gold_all if (p[0][2] - p[0][0]) > W0 * 0.3 and (p[0][3] - p[0][1]) < (p[0][2] - p[0][0]) * 0.35]
bottom = [p for p in gold_all if p not in swoosh]


def bbox(parts):
    return (min(p[0][0] for p in parts), min(p[0][1] for p in parts), max(p[0][2] for p in parts), max(p[0][3] for p in parts))


def path(parts, fill, dx=0, dy=0):
    d = ''.join(p[1] for p in parts)
    tr = f' transform="translate({dx:.1f} {dy:.1f})"' if dx or dy else ''
    return f'<path fill="{fill}" fill-rule="evenodd"{tr} d="{d}"/>'


def svg(x0, y0, x1, y1, body, pad=10):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0 - pad:.0f} {y0 - pad:.0f} {x1 - x0 + 2 * pad:.0f} {y1 - y0 + 2 * pad:.0f}">{body}</svg>'


# stacked: the original as drawn
allb = bbox(top + gold_all)
stacked = svg(*allb, path(top, A) + path(gold_all, B))

# wide: the two words on one line, bottoms aligned, no swooshes
tb, bb_ = bbox(top), bbox(bottom)
k = (tb[3] - tb[1]) / (bb_[3] - bb_[1]) * 0.78           # the second word drawn a little larger, closer to the first
gap = (tb[3] - tb[1]) * 0.22
dx, dy = tb[2] + gap - bb_[0] * k, tb[3] - bb_[3] * k
d = ''.join(p[1] for p in bottom)
wide = svg(tb[0], min(tb[1], bb_[1] * k + dy), bb_[2] * k + dx, tb[3],
           path(top, A) + f'<path fill="{B}" fill-rule="evenodd" transform="translate({dx:.1f} {dy:.1f}) scale({k:.3f})" d="{d}"/>')

# icon: the stacked logo on a disc
cx, cy, R = (allb[0] + allb[2]) / 2, (allb[1] + allb[3]) / 2, max(allb[2] - allb[0], allb[3] - allb[1]) * 0.62
icon = svg(cx - R, cy - R, cx + R, cy + R, f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{R:.1f}" fill="var(--logo-bg,#123524)"/>' + path(top, A) + path(gold_all, B), pad=0)

for name, s in [('stacked', stacked), ('wide', wide), ('icon', icon)]:
    open(os.path.join(ROOT, 'brand', f'logo-{name}.svg'), 'w').write(s)
with open(os.path.join(ROOT, 'js', 'brand.js'), 'w') as f:
    f.write('/* Sports Timeline logo, traced from the original (tools/tracelogo.py). Colours come from CSS: --logo-a (first word), --logo-b (second word and swooshes), --logo-bg (icon disc). */\n')
    f.write('window.ST_BRAND = ' + json.dumps({'stacked': stacked, 'wide': wide, 'icon': icon}, ensure_ascii=False) + ';\n')
print('paths', len(top), len(bottom), len(swoosh), 'bytes', len(stacked), len(wide), len(icon))
