import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type Mode = "follow" | "top" | "free";

interface Box {
  d: number;
  w: number;
  x: number;
  z: number;
}

interface LoopState {
  clock: number;
  frame: number;
  last: number;
  leg: number;
  mode: Mode;
  progress: number;
  running: boolean;
}

interface Palette {
  accent: string;
  high: string;
  low: string;
}

const HALF_W = 12;
const HALF_D = 8;
const WALL_H = 3;
const RACK_H = 2.4;
const RAYS = 180;
const RANGE = 9;
const SPEED = 1.6;
const SCAN_INTERVAL = 1 / 15;

const RACKS: Box[] = [-5, -1.5, 2, 5.5].flatMap((z) => [
  { d: 1, w: 6.8, x: -4.6, z },
  { d: 1, w: 6.8, x: 4.6, z },
]);

const ROUTE = [
  new Vector3(-10, 0, -3.25),
  new Vector3(10, 0, -3.25),
  new Vector3(10, 0, 3.75),
  new Vector3(-10, 0, 3.75),
];

function pushRackFaces(points: number[], box: Box) {
  for (let x = box.x - box.w / 2; x <= box.x + box.w / 2; x += 0.15) {
    for (let y = 0.1; y <= RACK_H; y += 0.2) {
      points.push(x, y, box.z - box.d / 2, x, y, box.z + box.d / 2);
    }
  }
  for (let z = box.z - box.d / 2; z <= box.z + box.d / 2; z += 0.2) {
    for (let y = 0.1; y <= RACK_H; y += 0.2) {
      points.push(box.x - box.w / 2, y, z, box.x + box.w / 2, y, z);
    }
  }
}

function pushWalls(points: number[]) {
  for (let y = 0.1; y <= WALL_H; y += 0.3) {
    for (let x = -HALF_W; x <= HALF_W; x += 0.3) {
      points.push(x, y, -HALF_D, x, y, HALF_D);
    }
    for (let z = -HALF_D; z <= HALF_D; z += 0.3) {
      points.push(-HALF_W, y, z, HALF_W, y, z);
    }
  }
}

function pushFloor(points: number[]) {
  for (let x = -HALF_W; x <= HALF_W; x += 0.5) {
    for (let z = -HALF_D; z <= HALF_D; z += 0.5) {
      points.push(x, 0, z);
    }
  }
}

function buildCloud() {
  const points: number[] = [];
  pushFloor(points);
  pushWalls(points);
  for (const rack of RACKS) {
    pushRackFaces(points, rack);
  }
  return new Float32Array(points);
}

function colorByHeight(positions: Float32Array, palette: Palette) {
  const low = new Color(palette.low);
  const high = new Color(palette.high);
  const colors = new Float32Array(positions.length);
  const mixed = new Color();
  for (let i = 0; i < positions.length; i += 3) {
    const t = Math.min(1, (positions[i + 1] as number) / WALL_H);
    mixed.copy(low).lerp(high, t);
    colors[i] = mixed.r;
    colors[i + 1] = mixed.g;
    colors[i + 2] = mixed.b;
  }
  return colors;
}

function rayToBox(ox: number, oz: number, dx: number, dz: number, box: Box) {
  const inv = (v: number) => (Math.abs(v) < 1e-9 ? 1e9 : 1 / v);
  const tx1 = (box.x - box.w / 2 - ox) * inv(dx);
  const tx2 = (box.x + box.w / 2 - ox) * inv(dx);
  const tz1 = (box.z - box.d / 2 - oz) * inv(dz);
  const tz2 = (box.z + box.d / 2 - oz) * inv(dz);
  const near = Math.max(Math.min(tx1, tx2), Math.min(tz1, tz2));
  const far = Math.min(Math.max(tx1, tx2), Math.max(tz1, tz2));
  return far >= Math.max(near, 0)
    ? Math.max(near, 0)
    : Number.POSITIVE_INFINITY;
}

function axisHit(origin: number, dir: number, half: number) {
  if (dir > 0) {
    return (half - origin) / dir;
  }
  if (dir < 0) {
    return (-half - origin) / dir;
  }
  return Number.POSITIVE_INFINITY;
}

function rayToWalls(ox: number, oz: number, dx: number, dz: number) {
  return Math.min(axisHit(ox, dx, HALF_W), axisHit(oz, dz, HALF_D));
}

function castScan(scan: Float32Array, x: number, z: number) {
  for (let i = 0; i < RAYS; i += 1) {
    const angle = (i / RAYS) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    let hit = Math.min(RANGE, rayToWalls(x, z, dx, dz));
    for (const rack of RACKS) {
      hit = Math.min(hit, rayToBox(x, z, dx, dz, rack));
    }
    scan[i * 3] = x + dx * hit;
    scan[i * 3 + 1] = 0.4;
    scan[i * 3 + 2] = z + dz * hit;
  }
}

function readPalette(el: HTMLElement): Palette {
  const styles = getComputedStyle(el);
  const value = (name: string) =>
    styles.getPropertyValue(name).trim() || "#888888";
  return {
    accent: value("--bronze"),
    high: value("--ink"),
    low: value("--surface-2"),
  };
}

export function mountPointCloud(
  host: HTMLElement,
  options: { reduced: boolean }
) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.append(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.display = "block";

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(-14, 5, -6);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.maxPolarAngle = Math.PI / 2.1;

  const cloudPositions = buildCloud();
  const cloudGeometry = new BufferGeometry();
  cloudGeometry.setAttribute(
    "position",
    new BufferAttribute(cloudPositions, 3)
  );
  const cloudMaterial = new PointsMaterial({
    size: 0.06,
    sizeAttenuation: true,
    vertexColors: true,
  });
  scene.add(new Points(cloudGeometry, cloudMaterial));

  const scan = new Float32Array(RAYS * 3);
  const scanGeometry = new BufferGeometry();
  scanGeometry.setAttribute("position", new BufferAttribute(scan, 3));
  const scanMaterial = new PointsMaterial({
    size: 0.12,
    sizeAttenuation: true,
  });
  scene.add(new Points(scanGeometry, scanMaterial));

  const robotGeometry = new BoxGeometry(0.9, 0.5, 0.6);
  const robotMaterial = new MeshBasicMaterial();
  const robot = new Mesh(robotGeometry, robotMaterial);
  scene.add(robot);

  const applyPalette = () => {
    const palette = readPalette(host);
    cloudGeometry.setAttribute(
      "color",
      new BufferAttribute(colorByHeight(cloudPositions, palette), 3)
    );
    scanMaterial.color = new Color(palette.accent);
    robotMaterial.color = new Color(palette.accent);
  };
  applyPalette();

  const position = (ROUTE[0] as Vector3).clone();
  const heading = new Vector3(1, 0, 0);
  const goal = new Vector3();
  const state: LoopState = {
    clock: SCAN_INTERVAL,
    frame: 0,
    last: 0,
    leg: 0,
    mode: "follow",
    progress: 0,
    running: false,
  };

  const resize = () => {
    const { clientWidth, clientHeight } = host;
    if (clientWidth && clientHeight) {
      renderer.setSize(clientWidth, clientHeight, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    }
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const advance = (delta: number) => {
    const from = ROUTE[state.leg] as Vector3;
    const to = ROUTE[(state.leg + 1) % ROUTE.length] as Vector3;
    if (!options.reduced) {
      state.progress += (SPEED * Math.min(delta, 0.05)) / from.distanceTo(to);
      if (state.progress >= 1) {
        state.progress = 0;
        state.leg = (state.leg + 1) % ROUTE.length;
      }
    }
    position.lerpVectors(from, to, state.progress);
    heading.subVectors(to, from).normalize();
    robot.position.set(position.x, 0.3, position.z);
    robot.rotation.set(0, Math.atan2(-heading.z, heading.x), 0);

    state.clock += delta;
    if (state.clock >= SCAN_INTERVAL) {
      state.clock = 0;
      castScan(scan, position.x, position.z);
      (scanGeometry.getAttribute("position") as BufferAttribute).needsUpdate =
        true;
    }
  };

  const aim = () => {
    const ease = options.reduced ? 1 : 0.07;
    if (state.mode === "follow") {
      goal.set(position.x - heading.x * 5, 3.2, position.z - heading.z * 5);
      camera.position.lerp(goal, ease);
      camera.lookAt(
        position.x + heading.x * 2,
        0.5,
        position.z + heading.z * 2
      );
    } else if (state.mode === "top") {
      goal.set(0, 21, 8);
      camera.position.lerp(goal, ease);
      camera.lookAt(0, 0, 0);
    } else {
      controls.update();
    }
  };

  const renderOnce = (delta: number) => {
    advance(delta);
    aim();
    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    const delta = state.last ? (now - state.last) / 1000 : 0;
    state.last = now;
    renderOnce(delta);
    state.frame = requestAnimationFrame(loop);
  };

  const settle = () => {
    for (let i = 0; i < 40; i += 1) {
      renderOnce(1 / 30);
    }
  };

  controls.addEventListener("change", () => {
    if (!state.running) {
      renderer.render(scene, camera);
    }
  });

  renderOnce(SCAN_INTERVAL);
  if (options.reduced) {
    settle();
  }

  return {
    dispose() {
      cancelAnimationFrame(state.frame);
      resizeObserver.disconnect();
      controls.dispose();
      for (const item of [
        cloudGeometry,
        scanGeometry,
        robotGeometry,
        cloudMaterial,
        scanMaterial,
        robotMaterial,
      ]) {
        item.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
    repaint() {
      applyPalette();
      renderer.render(scene, camera);
    },
    setMode(mode: Mode) {
      state.mode = mode;
      controls.enabled = mode === "free";
      if (mode === "free") {
        controls.target.set(position.x, 0, position.z);
      }
      if (options.reduced) {
        settle();
      }
    },
    start() {
      if (state.running || options.reduced) {
        return;
      }
      state.running = true;
      state.last = 0;
      state.frame = requestAnimationFrame(loop);
    },
    stop() {
      state.running = false;
      cancelAnimationFrame(state.frame);
    },
  };
}
