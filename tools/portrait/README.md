# Portrait generator

Builds `src/data/portrait.ts` (the hero portrait drawn in ones and zeros) and the no-JavaScript fallbacks `public/portrait-dark.png` and `public/portrait-light.png`. The source photo is not stored in the repo.

1. Lift the subject off the background with macOS Vision (macOS 14+):
   `swiftc -O lift.swift -o lift && ./lift photo.jpg subject.png <x> <y>`, where `x y` is a pixel on the face.
2. Build the grid and fallbacks (Python 3 with Pillow):
   `python3 grid.py subject.png portrait`, then copy `portrait-grid.txt` into `src/data/portrait.ts` and the two PNGs into `public/`.

Adjust `CROP` in `grid.py` to reframe.
