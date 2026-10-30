interface PortraitData {
  cols: number;
  data: string;
  rows: number;
}

interface Cell {
  digit: string;
  index: number;
  lockAt: number;
  value: number;
}

const DECODE_MS = 1300;
const FLICKER_MS = 140;
const FLICKER_CELLS = 10;

function parseCells(portrait: PortraitData): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0; i < portrait.data.length; i += 1) {
    const char = portrait.data[i] as string;
    if (char !== ".") {
      const row = Math.floor(i / portrait.cols);
      cells.push({
        digit: "",
        index: i,
        lockAt:
          (row / portrait.rows) * (DECODE_MS * 0.7) +
          Math.random() * DECODE_MS * 0.3,
        value: Number.parseInt(char, 16) / 15,
      });
    }
  }
  return cells;
}

export function mountPortrait(
  canvas: HTMLCanvasElement,
  portrait: PortraitData
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cells = parseCells(portrait);
  let ink = "";
  let dark = true;
  let cell = 0;
  let started = 0;
  let decoded = reduced;
  let flickerTimer = 0;
  let frame = 0;
  let visible = false;

  const readTheme = () => {
    ink =
      getComputedStyle(canvas).getPropertyValue("--ink").trim() || "#ecebe8";
    dark = document.documentElement.dataset.theme === "dark";
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!(rect.width && rect.height)) {
      return false;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    cell = canvas.width / portrait.cols;
    return true;
  };

  const settledDigit = (shade: number) => (shade > 0.55 ? "0" : "1");

  const draw = (now: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    ctx.font = `600 ${cell * 1.08}px Archivo, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const elapsed = now - started;
    for (const c of cells) {
      const shade = dark ? c.value : 1 - c.value;
      const x = (c.index % portrait.cols) * cell + cell / 2;
      const y = Math.floor(c.index / portrait.cols) * cell + cell / 2;
      if (decoded || elapsed >= c.lockAt) {
        if (shade < 0.06) {
          continue;
        }
        ctx.globalAlpha = 0.14 + 0.86 * shade;
        ctx.fillText(c.digit || settledDigit(shade), x, y);
      } else {
        ctx.globalAlpha = Math.random() * 0.35;
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", x, y);
      }
    }
    ctx.globalAlpha = 1;
  };

  const flicker = () => {
    for (let i = 0; i < FLICKER_CELLS; i += 1) {
      const c = cells[Math.floor(Math.random() * cells.length)];
      if (c) {
        const current = c.digit || settledDigit(dark ? c.value : 1 - c.value);
        c.digit = current === "0" ? "1" : "0";
      }
    }
    draw(performance.now());
    flickerTimer = window.setTimeout(flicker, FLICKER_MS);
  };

  const decode = (now: number) => {
    draw(now);
    if (now - started < DECODE_MS) {
      frame = requestAnimationFrame(decode);
    } else {
      decoded = true;
      draw(now);
      flickerTimer = window.setTimeout(flicker, FLICKER_MS);
    }
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    clearTimeout(flickerTimer);
  };

  const play = () => {
    stop();
    if (!(visible && !document.hidden)) {
      return;
    }
    if (reduced) {
      draw(performance.now());
    } else if (decoded) {
      flickerTimer = window.setTimeout(flicker, FLICKER_MS);
    } else {
      started = performance.now();
      frame = requestAnimationFrame(decode);
    }
  };

  readTheme();
  if (!resize()) {
    return;
  }
  if (reduced) {
    draw(performance.now());
  }
  canvas.dataset.ready = "true";

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    play();
  }).observe(canvas);
  document.addEventListener("visibilitychange", play);
  document.addEventListener("themechange", () => {
    requestAnimationFrame(() => {
      readTheme();
      draw(performance.now() + DECODE_MS);
    });
  });

  let size = `${canvas.clientWidth}x${canvas.clientHeight}`;
  new ResizeObserver(() => {
    const next = `${canvas.clientWidth}x${canvas.clientHeight}`;
    if (next !== size && resize()) {
      size = next;
      draw(performance.now() + DECODE_MS);
    }
  }).observe(canvas);
}
