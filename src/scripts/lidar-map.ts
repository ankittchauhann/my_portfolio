interface Cell {
  x: number;
  y: number;
}

const RAY_COUNT = 160;
const RANGE = 24;
const SPEED = 4.2;
const SCAN_HZ = 20;
const MEMORY = 0.38;

function seeded(seed: number) {
  let state = seed % 2_147_483_647;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

function placeRackRow(
  _row: number,
  depth: number,
  along: number,
  margin: number,
  rand: () => number,
  mark: (i: number, d: number) => void
) {
  let s = margin;
  while (s < along - margin) {
    const end = Math.min(
      s + Math.round(along * (0.18 + rand() * 0.14)),
      along - margin
    );
    for (let i = s; i < end; i += 1) {
      for (let d = 0; d < depth; d += 1) {
        mark(i, d);
      }
    }
    s = end + 3 + Math.round(rand() * 2);
  }
}

export function buildWarehouse(cols: number, rows: number) {
  const wall = new Uint8Array(cols * rows);
  const rand = seeded(42);
  const set = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < cols && y < rows) {
      wall[y * cols + x] = 1;
    }
  };

  for (let x = 0; x < cols; x += 1) {
    set(x, 0);
    set(x, rows - 1);
  }
  for (let y = 0; y < rows; y += 1) {
    set(0, y);
    set(cols - 1, y);
  }

  const portrait = rows > cols;
  const along = portrait ? rows : cols;
  const across = portrait ? cols : rows;
  const margin = Math.max(4, Math.round(along * 0.12));
  const rackDepth = 2;
  const aisle = 4;

  for (let a = 4; a + rackDepth < across - 4; a += rackDepth + aisle) {
    placeRackRow(a, rackDepth, along, margin, rand, (i, d) =>
      portrait ? set(a + d, i) : set(i, a + d)
    );
  }

  for (let i = 0; i < Math.round(along / 9); i += 1) {
    const p = 2 + Math.round(rand() * (along - 4));
    if (portrait) {
      set(cols - 2, p);
    } else {
      set(p, rows - 2);
    }
  }
  return wall;
}

function markAround(
  blocked: Uint8Array,
  cols: number,
  rows: number,
  x: number,
  y: number
) {
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
        blocked[ny * cols + nx] = 1;
      }
    }
  }
}

function inflate(wall: Uint8Array, cols: number, rows: number) {
  const blocked = new Uint8Array(wall);
  wall.forEach((value, i) => {
    if (value) {
      markAround(blocked, cols, rows, i % cols, Math.floor(i / cols));
    }
  });
  return blocked;
}

function plan(
  blocked: Uint8Array,
  cols: number,
  rows: number,
  from: Cell,
  to: Cell
): Cell[] {
  const start = from.y * cols + from.x;
  const goal = to.y * cols + to.x;
  const prev = new Int32Array(cols * rows).fill(-1);
  prev[start] = start;
  const queue = [start];
  const steps = [1, -1, cols, -cols, cols + 1, cols - 1, -cols + 1, -cols - 1];
  for (const cur of queue) {
    if (cur === goal) {
      break;
    }
    const cx = cur % cols;
    for (const step of steps) {
      const next = cur + step;
      const nx = next % cols;
      if (next < 0 || next >= cols * rows || Math.abs(nx - cx) > 1) {
        continue;
      }
      if (blocked[next] || prev[next] !== -1) {
        continue;
      }
      prev[next] = cur;
      queue.push(next);
    }
  }
  if (prev[goal] === -1) {
    return [];
  }
  const path: Cell[] = [];
  for (let c = goal; c !== start; c = prev[c] as number) {
    path.push({ x: c % cols, y: Math.floor(c / cols) });
  }
  return path.reverse();
}

function nearestFree(
  blocked: Uint8Array,
  cols: number,
  rows: number,
  cell: Cell
): Cell | null {
  for (let r = 0; r < Math.max(cols, rows); r += 1) {
    for (let dy = -r; dy <= r; dy += 1) {
      for (let dx = -r; dx <= r; dx += 1) {
        const x = cell.x + dx;
        const y = cell.y + dy;
        if (
          x > 0 &&
          y > 0 &&
          x < cols - 1 &&
          y < rows - 1 &&
          !blocked[y * cols + x]
        ) {
          return { x, y };
        }
      }
    }
  }
  return null;
}

export function mountLidarMap(
  canvas: HTMLCanvasElement,
  trigger?: Element | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const palette = {
    bronze: "",
    ground: "",
    ink: "",
    surface: "",
    surface2: "",
  };
  const readPalette = () => {
    const styles = getComputedStyle(canvas);
    palette.ink = styles.getPropertyValue("--ink").trim();
    palette.surface = styles.getPropertyValue("--surface").trim();
    palette.surface2 = styles.getPropertyValue("--surface-2").trim();
    palette.ground = styles.getPropertyValue("--ground").trim();
    palette.bronze = styles.getPropertyValue("--bronze").trim();
  };
  readPalette();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let cols = 0;
  let rows = 0;
  let cell = 10;
  let wall = new Uint8Array(0);
  let blocked = new Uint8Array(0);
  let hit = new Float32Array(0);
  let seen = new Uint8Array(0);
  let scan: Cell[] = [];
  const robot = { heading: 0, x: 0, y: 0 };
  let path: Cell[] = [];
  let goal: Cell | null = null;
  const rand = seeded(7);

  function randomGoal() {
    for (let i = 0; i < 40; i += 1) {
      const c = {
        x: 1 + Math.floor(rand() * (cols - 2)),
        y: 1 + Math.floor(rand() * (rows - 2)),
      };
      const far =
        Math.hypot(c.x - robot.x, c.y - robot.y) > Math.min(cols, rows) * 0.45;
      if (!blocked[c.y * cols + c.x] && far) {
        return c;
      }
    }
    return nearestFree(blocked, cols, rows, {
      x: Math.floor(cols / 2),
      y: Math.floor(rows / 2),
    });
  }

  function sendTo(target: Cell | null) {
    if (!target) {
      return;
    }
    const free = nearestFree(blocked, cols, rows, target);
    if (!free) {
      return;
    }
    const from = { x: Math.round(robot.x), y: Math.round(robot.y) };
    const route = plan(blocked, cols, rows, from, free);
    if (route.length) {
      goal = free;
      path = route;
    }
  }

  function castScan() {
    scan = [];
    for (let i = 0; i < RAY_COUNT; i += 1) {
      const angle = (i / RAY_COUNT) * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      for (let d = 0.5; d < RANGE; d += 0.25) {
        const x = Math.floor(robot.x + 0.5 + dx * d);
        const y = Math.floor(robot.y + 0.5 + dy * d);
        if (x < 0 || y < 0 || x >= cols || y >= rows) {
          break;
        }
        const idx = y * cols + x;
        if (wall[idx]) {
          hit[idx] = 1;
          scan.push({ x, y });
          break;
        }
        seen[idx] = 1;
      }
    }
  }

  function step(dt: number) {
    if (!path.length) {
      sendTo(randomGoal());
    }
    const [next] = path;
    if (next) {
      const dx = next.x - robot.x;
      const dy = next.y - robot.y;
      const dist = Math.hypot(dx, dy);
      const move = SPEED * dt;
      if (dist <= move) {
        robot.x = next.x;
        robot.y = next.y;
        path.shift();
      } else {
        robot.x += (dx / dist) * move;
        robot.y += (dy / dist) * move;
      }
      const target = Math.atan2(dy, dx);
      const turn = Math.atan2(
        Math.sin(target - robot.heading),
        Math.cos(target - robot.heading)
      );
      robot.heading += turn * Math.min(1, dt * 8);
    }
    for (let i = 0; i < hit.length; i += 1) {
      const v = hit[i] as number;
      if (v > MEMORY) {
        hit[i] = Math.max(MEMORY, v - dt * 0.9);
      }
    }
  }

  function draw() {
    if (!ctx) {
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    const scale = w / (cols * cell);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = palette.ink;
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < seen.length; i += 1) {
      if (seen[i]) {
        ctx.fillRect(
          (i % cols) * cell,
          Math.floor(i / cols) * cell,
          cell,
          cell
        );
      }
    }
    ctx.globalAlpha = 1;

    const dot = Math.max(2, cell * 0.34);
    const off = (cell - dot) / 2;
    ctx.fillStyle = palette.ink;
    for (let i = 0; i < hit.length; i += 1) {
      const v = hit[i] as number;
      if (v > 0) {
        ctx.globalAlpha = v;
        ctx.fillRect(
          (i % cols) * cell + off,
          Math.floor(i / cols) * cell + off,
          dot,
          dot
        );
      }
    }
    ctx.globalAlpha = 1;
    const big = dot * 1.6;
    const bigOff = (cell - big) / 2;
    for (const p of scan) {
      ctx.fillRect(p.x * cell + bigOff, p.y * cell + bigOff, big, big);
    }

    ctx.fillStyle = palette.bronze;
    ctx.globalAlpha = 0.55;
    for (let i = 1; i < path.length; i += 2) {
      const p = path[i] as Cell;
      ctx.fillRect(p.x * cell + off, p.y * cell + off, dot, dot);
    }
    ctx.globalAlpha = 1;
    if (goal) {
      ctx.fillRect(
        goal.x * cell - cell * 0.3,
        goal.y * cell - cell * 0.3,
        cell * 1.6,
        cell * 1.6
      );
      ctx.fillStyle = palette.ground;
      ctx.fillRect(
        goal.x * cell + cell * 0.15,
        goal.y * cell + cell * 0.15,
        cell * 0.7,
        cell * 0.7
      );
      ctx.fillStyle = palette.bronze;
    }

    const cx = robot.x * cell + cell / 2;
    const cy = robot.y * cell + cell / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(robot.heading);
    ctx.fillRect(-cell * 0.9, -cell * 0.7, cell * 1.8, cell * 1.4);
    ctx.fillStyle = palette.ground;
    ctx.fillRect(cell * 0.35, -cell * 0.2, cell * 0.4, cell * 0.4);
    ctx.restore();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!(rect.width && rect.height)) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const target = rect.width < 520 ? 9 : 11;
    cols = Math.max(12, Math.round(rect.width / target));
    cell = (rect.width / cols) * dpr;
    rows = Math.max(12, Math.ceil((rect.height * dpr) / cell));
    wall = buildWarehouse(cols, rows);
    blocked = inflate(wall, cols, rows);
    hit = new Float32Array(cols * rows);
    seen = new Uint8Array(cols * rows);
    const start = nearestFree(blocked, cols, rows, {
      x: 3,
      y: Math.floor(rows / 2),
    });
    robot.x = start?.x ?? 2;
    robot.y = start?.y ?? 2;
    path = [];
    goal = null;
    canvas.dataset.ready = "true";
  }

  resize();
  if (!cols) {
    return;
  }

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    sendTo({
      x: Math.floor(((event.clientX - rect.left) / rect.width) * cols),
      y: Math.floor(((event.clientY - rect.top) / rect.height) * rows),
    });
  });
  trigger?.addEventListener("click", () => sendTo(randomGoal()));

  document.addEventListener("themechange", () => {
    requestAnimationFrame(() => {
      readPalette();
      draw();
    });
  });

  const warmUp = (steps: number) => {
    for (let i = 0; i < steps; i += 1) {
      step(1 / SCAN_HZ);
      castScan();
    }
  };

  if (reduced) {
    warmUp(2400);
    scan = [];
    draw();
    return;
  }

  warmUp(360);
  draw();

  let visible = true;
  let last = performance.now();
  let scanClock = 0;
  let frame = 0;

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    scanClock += dt;
    if (scanClock >= 1 / SCAN_HZ) {
      scanClock = 0;
      castScan();
    }
    draw();
    frame = requestAnimationFrame(loop);
  };

  const run = () => {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    run();
  }).observe(canvas);
  document.addEventListener("visibilitychange", run);

  let resizeTimer = 0;
  let size = `${canvas.clientWidth}x${canvas.clientHeight}`;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const next = `${canvas.clientWidth}x${canvas.clientHeight}`;
      if (next === size) {
        return;
      }
      size = next;
      resize();
      warmUp(360);
      draw();
      run();
    }, 200);
  }).observe(canvas);
}
