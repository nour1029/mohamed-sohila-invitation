from PIL import Image, ImageFilter

SRC = '/Users/noue/Desktop/wedding/assets/img/_source/scrape/15-Screenshot_2026-06-2.png'
im = Image.open(SRC).convert('RGB')
W, H = im.size
px = im.load()

def is_gold(c):
    r, g, b = c
    return r <= 228 and (r - b) >= 55 and (g - b) >= 20 and r >= 105

# Only inside the central column where the baked text lives. Outside this box
# the same test also matches rose centres and warm stone, which must survive.
BOX = (int(0.26*W), int(0.155*H), int(0.80*W), int(0.795*H))
x0b, y0b, x1b, y1b = BOX

mask = [[False]*W for _ in range(H)]
count = 0
for y in range(y0b, y1b):
    row = mask[y]
    for x in range(x0b, x1b):
        if is_gold(px[x, y]):
            row[x] = True; count += 1
print(f"gold pixels in text box: {count}")

# Dilate so antialiased glyph edges go too, otherwise a gold halo remains.
R = 3
dil = [[False]*W for _ in range(H)]
for y in range(y0b, y1b):
    for x in range(x0b, x1b):
        if mask[y][x]:
            for dy in range(-R, R+1):
                yy = y+dy
                if y0b-R <= yy < y1b+R and 0 <= yy < H:
                    drow = dil[yy]
                    for dx in range(-R, R+1):
                        xx = x+dx
                        if 0 <= xx < W: drow[xx] = True

# Horizontal interpolation: glyph strokes are narrow, so the nearest clean
# pixel left and right in the same row is true background.
filled = 0
for y in range(max(0,y0b-R), min(H, y1b+R)):
    drow = dil[y]
    x = 0
    while x < W:
        if not drow[x]:
            x += 1; continue
        s = x
        while x < W and drow[x]: x += 1
        e = x - 1
        left  = px[s-1, y] if s-1 >= 0 and not drow[s-1] else None
        right = px[e+1, y] if e+1 < W and not drow[e+1] else None
        if left is None and right is None:
            continue
        if left is None:  left = right
        if right is None: right = left
        span = e - s + 1
        for i in range(span):
            t = (i + 1) / (span + 1)
            px[s+i, y] = tuple(round(left[k]*(1-t) + right[k]*t) for k in range(3))
            filled += 1
print(f"pixels repainted: {filled}")

# A whisper of blur only over the repainted band, to kill interpolation banding.
region = im.crop((x0b-R, y0b-R, x1b+R, y1b+R))
im.paste(region.filter(ImageFilter.GaussianBlur(0.6)), (x0b-R, y0b-R))

out = '/Users/noue/Desktop/wedding/assets/img/hero-scene.jpg'
im.save(out, 'JPEG', quality=88, optimize=True, progressive=True)
import os
print(f"saved {out}  {os.path.getsize(out)/1024:.0f} KB  {W}x{H}")
