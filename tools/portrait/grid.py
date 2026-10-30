import sys
from PIL import Image, ImageOps, ImageFilter

src, out_prefix = sys.argv[1], sys.argv[2]
COLS, ROWS = 76, 95
CROP = (210, 380, 850, 1180)  # head and shoulders, other person excluded

im = Image.open(src).convert("RGBA").crop(CROP)
alpha = im.getchannel("A")
gray = ImageOps.grayscale(im.convert("RGB"))
# stretch contrast using only subject pixels
pix = [g for g, a in zip(gray.getdata(), alpha.getdata()) if a > 128]
pix.sort()
lo, hi = pix[int(len(pix) * 0.03)], pix[int(len(pix) * 0.97)]
gray = gray.point(lambda v: max(0, min(255, int((v - lo) * 255 / max(1, hi - lo)))))
gray = gray.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=2))

small_g = gray.resize((COLS, ROWS), Image.Resampling.LANCZOS)
small_a = alpha.resize((COLS, ROWS), Image.Resampling.BOX)
chars = []
for g, a in zip(small_g.getdata(), small_a.getdata()):
    chars.append("." if a < 110 else "0123456789abcdef"[min(15, g // 16)])
data = "".join(chars)
with open(out_prefix + "-grid.txt", "w") as f:
    f.write(data)

# 1-bit dithered fallbacks (no JavaScript): light dots for the dark theme, dark dots for the light theme
SCALE = 4
big_g = gray.resize((COLS * SCALE, ROWS * SCALE), Image.Resampling.LANCZOS)
big_a = alpha.resize((COLS * SCALE, ROWS * SCALE), Image.Resampling.BOX)
for name, invert, ink in (("dark", False, (236, 235, 232)), ("light", True, (16, 17, 20))):
    g = ImageOps.invert(big_g) if invert else big_g
    bits = g.convert("1")  # Floyd-Steinberg
    outimg = Image.new("RGBA", bits.size, (0, 0, 0, 0))
    px, bp, ap = outimg.load(), bits.load(), big_a.load()
    for y in range(bits.size[1]):
        for x in range(bits.size[0]):
            if ap[x, y] > 110 and bp[x, y]:
                px[x, y] = (*ink, 255)
    outimg.save(f"{out_prefix}-{name}.png", optimize=True)

# preview of what the grid encodes
prev = Image.new("RGB", (COLS * 6, ROWS * 6), (16, 17, 20))
pp = prev.load()
for i, c in enumerate(data):
    if c == ".":
        continue
    v = int(c, 16) * 17
    x0, y0 = (i % COLS) * 6, (i // COLS) * 6
    for dy in range(5):
        for dx in range(5):
            pp[x0 + dx, y0 + dy] = (v, v, v)
prev.save(out_prefix + "-preview.png")
subject = sum(1 for c in data if c != ".")
print(f"grid {COLS}x{ROWS}, subject cells {subject}/{len(data)}, bytes {len(data)}")
