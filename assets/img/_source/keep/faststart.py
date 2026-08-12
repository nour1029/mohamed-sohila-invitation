"""Move the moov atom ahead of mdat so the video streams instead of
requiring a full download first (what qt-faststart does).

Chunk offsets inside moov are absolute file positions, so every stco/co64
entry has to be shifted by the size of moov once it moves in front.
"""
import struct, sys, shutil, os

def atoms(buf, start, end):
    off = start
    while off < end - 8:
        ln = struct.unpack('>I', buf[off:off+4])[0]
        typ = bytes(buf[off+4:off+8])
        hdr = 8
        if ln == 1:
            ln = struct.unpack('>Q', buf[off+8:off+16])[0]; hdr = 16
        elif ln == 0:
            ln = end - off
        if ln < hdr: break
        yield off, ln, typ, hdr
        off += ln

CONTAINERS = {b'moov', b'trak', b'mdia', b'minf', b'stbl', b'edts', b'udta'}

def patch_offsets(buf, start, end, shift):
    n = 0
    for off, ln, typ, hdr in atoms(buf, start, end):
        if typ in CONTAINERS:
            n += patch_offsets(buf, off + hdr, off + ln, shift)
        elif typ == b'stco':
            cnt = struct.unpack('>I', buf[off+hdr+4:off+hdr+8])[0]
            p = off + hdr + 8
            for i in range(cnt):
                v = struct.unpack('>I', buf[p:p+4])[0]
                struct.pack_into('>I', buf, p, v + shift); p += 4
            n += cnt
        elif typ == b'co64':
            cnt = struct.unpack('>I', buf[off+hdr+4:off+hdr+8])[0]
            p = off + hdr + 8
            for i in range(cnt):
                v = struct.unpack('>Q', buf[p:p+8])[0]
                struct.pack_into('>Q', buf, p, v + shift); p += 8
            n += cnt
    return n

src = sys.argv[1]
buf = bytearray(open(src, 'rb').read())
top = list(atoms(buf, 0, len(buf)))
names = [(t.decode('latin1'), o, l) for o, l, t, _ in top]
print("  before:", " ".join(f"{n}@{o}" for n, o, l in names))

moov = next((o, l) for o, l, t, _ in top if t == b'moov')
mdat = next((o, l) for o, l, t, _ in top if t == b'mdat')
if moov[0] < mdat[0]:
    print("  already faststart; nothing to do"); sys.exit(0)

moov_bytes = bytearray(buf[moov[0]:moov[0]+moov[1]])
moved = patch_offsets(moov_bytes, 8, len(moov_bytes), moov[1])
print(f"  patched {moved} chunk offsets by +{moov[1]}")

out = bytearray()
for o, l, t, _ in top:
    if t == b'moov': continue
    if t == b'mdat':
        out += moov_bytes
    out += buf[o:o+l]

dst = src.replace('.mov', '-faststart.mov')
open(dst, 'wb').write(out)
print(f"  wrote {dst}  {os.path.getsize(dst)/1024/1024:.2f} MB (was {os.path.getsize(src)/1024/1024:.2f} MB)")
after = list(atoms(bytearray(open(dst,'rb').read()), 0, os.path.getsize(dst)))
print("  after: ", " ".join(f"{t.decode('latin1')}@{o}" for o, l, t, _ in after))
