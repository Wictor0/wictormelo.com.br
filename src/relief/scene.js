// Cena 3D do relevo de Pernambuco. Este arquivo é o único que importa o
// Three.js e só entra por import() dinâmico (ver Relevo.jsx), então nada
// daqui pesa no carregamento inicial do site.
//
// Dois modos:
//  - 'inline' (no Contato): a rolagem leva o mapa do plano, idêntico ao SVG do
//    site, para o relevo inclinado. Depois ele balança devagar, e o dedo ou o
//    mouse dão um empurrão que volta sozinho. O gesto vertical continua rolando
//    a página.
//  - 'explore' (tela cheia): liberdade total. Arrastar gira e inclina, pinça ou
//    roda aproximam, e o giro lento volta quando a pessoa solta.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Fog, Color, Vector3, MathUtils,
} from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { thinLevels } from './loadRelief.js';

const AZUL = 0x1e3540;
const BASE_HEIGHT = 0.35; // altura com que o relevo é carregado; o exagero vira escala em Y
const FOV = 28;
const TOP = 89.9;         // "de cima": 90° exatos deixam a câmera sem direção de cima
const SWAY = 0.3;         // balanço do modo inline, em radianos (~17°)
const SWAY_PERIOD = 28;   // segundos para ir e voltar

export const DEFAULTS = {
  height: 0.13,      // exagero vertical, em unidades de cena (largura do mapa = 2)
  thin: 1,           // 1 = todas as curvas, 2 = uma a cada 100 m, 3 = a cada 150 m
  speed: 3,          // giro do modo explorar, em graus por segundo
  angle: 40,         // elevação da câmera no relevo levantado, em graus
  zoom: 1,
  borderWidth: 1.6,  // px, igual ao contorno do SVG do site
  lineWidth: 1,      // px, igual às curvas do SVG do site
  lineOpacity: 0.75, // idem
  depth: 0.45,       // 0 = sem esmaecer o fundo, 1 = fundo quase some
  tilt: 1,           // quanto o mouse inclina
  color: 0xf4efe6,
};

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a, b, t) => { const x = MathUtils.clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

// Junta várias polilinhas em um único buffer de segmentos (um draw call só)
function segments(lines) {
  let n = 0;
  for (const l of lines) n += Math.max(0, l.positions.length / 3 - 1);
  const out = new Float32Array(n * 6);
  let o = 0;
  for (const l of lines) {
    const p = l.positions;
    for (let i = 0; i + 5 < p.length; i += 3) {
      out[o++] = p[i]; out[o++] = p[i + 1]; out[o++] = p[i + 2];
      out[o++] = p[i + 3]; out[o++] = p[i + 4]; out[o++] = p[i + 5];
    }
  }
  return out;
}

function makeLines(material) {
  const mesh = new LineSegments2(new LineSegmentsGeometry(), material);
  mesh.frustumCulled = false;
  return mesh;
}

/**
 * @param {HTMLElement} container  recebe o <canvas>; precisa ter tamanho definido
 * @param {object} relief          resultado de loadRelief({ width: 2, height: 0.35 })
 * @param {object} [opts]
 * @param {'inline'|'explore'} [opts.mode]
 * @param {object} [opts.frame]    { cx, cz, w, h } área do mapa plano, em unidades de
 *                                 cena; no modo inline o estado plano enquadra isto
 * @param {object} [opts.params]   ver DEFAULTS
 * @param {Array}  [opts.points]   [{ x, z, altitude, el }] rótulos HTML a posicionar
 * @param {Element}  [opts.flat]   o SVG plano por baixo; a cena faz a troca de um
 *                                 para o outro enquanto o mapa levanta
 * @param {function} [opts.onWeak] quando nem o nível mais leve segura 30 fps
 */
export function createReliefScene(container, relief, opts = {}) {
  const mode = opts.mode || 'inline';
  const explore = mode === 'explore';
  const params = { ...DEFAULTS, ...opts.params };
  const frame = opts.frame || { cx: 0, cz: 0, w: relief.size.x, h: relief.size.z };
  const points = opts.points || [];
  let auto = true;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(AZUL, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = `display:block;width:100%;height:100%;touch-action:${explore ? 'none' : 'pan-y'};cursor:grab`;
  container.appendChild(canvas);

  const scene = new Scene();
  scene.fog = new Fog(new Color(AZUL), 1, 10);
  const camera = new PerspectiveCamera(FOV, 1, 0.05, 60);
  const group = new Group();
  scene.add(group);

  const common = { color: params.color, transparent: true, depthTest: false, depthWrite: false, fog: true };
  const lineMat = new LineMaterial({ ...common, linewidth: params.lineWidth, opacity: params.lineOpacity });
  const borderMat = new LineMaterial({ ...common, linewidth: params.borderWidth, opacity: 1 });
  const contours = makeLines(lineMat);
  const border = makeLines(borderMat);
  border.renderOrder = 1;
  group.add(contours, border);

  const borderLines = relief.lines.filter((l) => l.isBorder);
  border.geometry.setPositions(segments(borderLines));

  function setThin(n) {
    params.thin = n;
    const kept = (n > 1 ? thinLevels(relief, n) : relief.lines).filter((l) => !l.isBorder);
    contours.geometry.dispose(); // não reaproveita o buffer quando o tamanho muda
    contours.geometry = new LineSegmentsGeometry();
    contours.geometry.setPositions(segments(kept));
  }
  setThin(params.thin);

  // amostra do contorno, para o enquadramento caber o mapa inteiro
  const hull = [];
  for (const l of borderLines) {
    const p = l.positions;
    const step = Math.max(1, Math.floor(p.length / 3 / 80));
    for (let i = 0; i < p.length; i += 3 * step) hull.push([p[i], p[i + 2]]);
  }

  // ---- enquadramento ----
  const target = new Vector3();
  const v = new Vector3();
  const tmpCam = new PerspectiveCamera(FOV, 1, 0.05, 60);

  // menor distância em que o contorno, girado por cada `az`, cabe na tela
  function fitDistance(el, azList, aspect, height) {
    tmpCam.aspect = aspect; tmpCam.updateProjectionMatrix();
    const fits = (d) => {
      tmpCam.position.set(0, height * 0.3 + Math.sin(el) * d, Math.cos(el) * d);
      tmpCam.lookAt(0, height * 0.3, 0);
      tmpCam.updateMatrixWorld();
      for (const az of azList) {
        const c = Math.cos(az), s = Math.sin(az);
        for (const [x, z] of hull) {
          for (const y of [0, height * 0.6]) {
            v.set(x * c + z * s, y, -x * s + z * c).project(tmpCam);
            if (Math.abs(v.x) > 0.97 || Math.abs(v.y) > 0.93 || v.z > 1) return false;
          }
        }
      }
      return true;
    };
    let lo = 0.3, hi = 30;
    for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; }
    return hi;
  }

  let w = 1, h = 1, aspect = 1, dFlat = 1, dRaised = 1;
  // explorar: distância que enquadra o mapa em cada um de 24 giros, para a
  // elevação atual. A câmera fica entre "cabe neste giro" e "cabe em qualquer giro",
  // então o mapa ocupa bem a tela, inclusive no celular em pé, sem pular.
  const RING = 24;
  let spin = { el: -1, d: new Float32Array(RING), max: 1 };
  function spinTable(elDeg) {
    const er = MathUtils.degToRad(elDeg);
    for (let i = 0; i < RING; i++) spin.d[i] = fitDistance(er, [(i / RING) * Math.PI * 2], aspect, params.height);
    spin.max = Math.max(...spin.d);
    spin.el = elDeg;
  }
  function spinDistance(az, elDeg) {
    if (Math.abs(elDeg - spin.el) > 4) spinTable(elDeg);
    const t = ((az / (Math.PI * 2)) % 1 + 1) % 1 * RING;
    const i = Math.floor(t), f = t - i;
    const here = spin.d[i % RING] * (1 - f) + spin.d[(i + 1) % RING] * f;
    return MathUtils.lerp(spin.max, here, 0.65);
  }
  function layout() {
    const vf = MathUtils.degToRad(FOV) / 2;
    // plano visto de cima: a altura visível é exatamente a do frame
    dFlat = frame.h / 2 / Math.tan(vf);
    dRaised = fitDistance(MathUtils.degToRad(params.angle), [-SWAY, -SWAY / 2, 0, SWAY / 2, SWAY], aspect, params.height);
    if (explore) spin.el = -1;
  }
  function resize() {
    w = Math.max(1, container.clientWidth);
    h = Math.max(1, container.clientHeight);
    aspect = w / h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    layout();
  }
  const ro = new ResizeObserver(() => { resize(); if (!running) draw(0); });
  ro.observe(container);
  resize();

  // ---- progresso pela rolagem (inline) ----
  let prog = explore ? 1 : 0;
  function scrollTarget() {
    const r = container.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // 0 quando o mapa entra pela base da tela; 1 quando o topo dele passa de 35%
    return MathUtils.clamp((vh * 0.95 - r.top) / (vh * 0.6), 0, 1);
  }
  // para conferir o encaixe com o SVG: ?relevo-p=0 congela o progresso
  let fixed = null;
  try { const q = new URLSearchParams(window.location.search).get('relevo-p'); if (q != null) fixed = Number(q); } catch {}
  if (!explore) prog = fixed ?? (scrollTarget() < 0.02 ? 0 : scrollTarget());

  // ---- mouse inclina de leve (computador) ----
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMouse = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (drags.size) return;
    tilt.tx = MathUtils.clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
    tilt.ty = MathUtils.clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
  };
  window.addEventListener('pointermove', onMouse, { passive: true });

  // ---- gestos ----
  // giro: em 'inline' é um deslocamento que volta para o balanço; em 'explore' é livre
  let az = explore ? -0.35 : 0;      // explore: ângulo livre
  let push = 0, pushVel = 0;         // inline: empurrão e a velocidade dele
  let spinVel = 0;                   // explore: inércia depois de soltar
  let idle = 0;                      // explore: tempo desde o último toque
  let el = params.angle;             // explore: elevação livre
  let zoom = params.zoom;
  let swayT = 0;

  const drags = new Map();
  let pinch = null;
  const pinchDist = () => { const [a, b] = [...drags.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

  const onDown = (e) => {
    if (e.button) return;
    drags.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    canvas.style.cursor = 'grabbing';
    spinVel = 0; idle = 0;
    if (explore && drags.size === 2) pinch = { d: pinchDist(), zoom };
  };
  const onMove = (e) => {
    const d = drags.get(e.pointerId);
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    const dt = Math.max(1, now - d.t) / 1000;
    d.x = e.clientX; d.y = e.clientY; d.t = now;
    const turn = (dx / Math.max(320, w)) * Math.PI * 1.2;
    if (explore) {
      if (pinch && drags.size === 2) {
        zoom = MathUtils.clamp(pinch.zoom * (pinchDist() / pinch.d), 0.7, 4);
      } else if (drags.size === 1) {
        az += turn;
        spinVel = turn / dt;
        el = MathUtils.clamp(el + dy * 0.25, 8, 85);
      }
    } else {
      push += turn;
      pushVel = turn / dt;
    }
    idle = 0;
    if (!running && !disposed) draw(0);
  };
  const onUp = (e) => {
    if (!drags.delete(e.pointerId)) return;
    if (drags.size < 2) pinch = null;
    if (!drags.size) canvas.style.cursor = 'grab';
  };
  const onWheel = (e) => {
    if (!explore) return;
    e.preventDefault();
    zoom = MathUtils.clamp(zoom * Math.exp(-e.deltaY * 0.0015), 0.7, 4);
    idle = 0;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // ---- laço ----
  let raf = 0, running = false, last = 0;
  let visible = true, onScreen = true, paused = false, disposed = false;
  let slowT = 0, slowN = 0, grace = 1500;

  function draw(dt) {
    if (!explore) {
      const goal = fixed ?? scrollTarget();
      prog += (goal - prog) * Math.min(1, dt * 5);
      if (Math.abs(goal - prog) < 0.001) prog = goal;
    }
    const p = ease(prog);
    // as curvas do SVG e as do 3D vêm de cortes diferentes do mesmo relevo, então
    // não coincidem uma a uma: o contorno coincide, e as curvas se trocam enquanto
    // o mapa começa a levantar
    if (opts.flat) {
      const f = smooth(0.02, 0.32, prog);
      canvas.style.opacity = f.toFixed(3);
      opts.flat.style.opacity = (1 - f).toFixed(3);
    }
    const k = smooth(0.55, 1, prog); // giro e inclinação só entram quando já levantou

    tilt.x += (tilt.tx - tilt.x) * Math.min(1, dt * 3);
    tilt.y += (tilt.ty - tilt.y) * Math.min(1, dt * 3);

    let rot, elev, dist;
    if (explore) {
      idle += dt;
      if (!drags.size) {
        az += spinVel * dt;
        spinVel *= Math.exp(-dt * 2.5);
        if (idle > 2.5) az += MathUtils.degToRad(params.speed) * dt * Math.min(1, (idle - 2.5) / 2);
      }
      rot = az;
      elev = el;
      dist = spinDistance(az, el) / zoom;
    } else {
      swayT += dt * (drags.size ? 0 : 1);
      if (!drags.size) {
        // o empurrão anda com a inércia e uma mola traz de volta para o balanço
        push += pushVel * dt;
        pushVel += (-push * 2.2 - pushVel * 1.6) * dt;
      }
      rot = (Math.sin((swayT / SWAY_PERIOD) * Math.PI * 2) * SWAY + push) * k;
      elev = MathUtils.lerp(TOP, params.angle, p);
      dist = MathUtils.lerp(dFlat, dRaised, p);
    }
    rot += MathUtils.degToRad(tilt.x * 6 * params.tilt) * k;
    elev = MathUtils.clamp(elev - tilt.y * 4 * params.tilt * k, 3, TOP);

    const height = params.height * p;
    group.scale.y = Math.max(1e-4, height / BASE_HEIGHT);
    group.rotation.y = rot;

    // no plano o centro é o do frame do SVG; levantado, o centro do mapa
    target.set(frame.cx * (1 - p), height * 0.3, frame.cz * (1 - p));
    const er = MathUtils.degToRad(elev);
    camera.position.set(target.x, target.y + Math.sin(er) * dist, target.z + Math.cos(er) * dist);
    camera.lookAt(target);

    const depth = params.depth * p;
    scene.fog.near = dist - 1.1 + (1 - depth) * 4;
    scene.fog.far = dist + 1.1 + (1 - depth) * 12 + 0.6;
    lineMat.linewidth = params.lineWidth;
    lineMat.opacity = MathUtils.lerp(params.lineOpacity, 0.85, p);
    borderMat.linewidth = params.borderWidth;

    renderer.render(scene, camera);

    // rótulos: projeta cada ponto na tela e move o elemento HTML
    for (const pt of points) {
      if (!pt.el) continue;
      v.set(pt.x, pt.y, pt.z).applyMatrix4(group.matrixWorld);
      const d = camera.position.distanceTo(v);
      v.project(camera);
      pt.el.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-v.y * 0.5 + 0.5) * h).toFixed(1)}px,0)`;
      pt.el.style.opacity = (0.55 + 0.45 * MathUtils.clamp((dist + 1 - d) / 2, 0, 1)).toFixed(2);
    }
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dtMs = now - last;
    last = now;
    if (dtMs > 250) { draw(0); return; } // voltou de uma pausa: não conta
    draw(dtMs / 1000);

    // requisito: acima de 30 fps. Primeiro corta curvas, depois desiste do 3D.
    if (!auto) return;
    if (grace > 0) { grace -= dtMs; return; }
    slowT += dtMs; slowN++;
    if (slowT >= 2000) {
      const fps = (slowN * 1000) / slowT;
      slowT = 0; slowN = 0;
      if (fps < 30) {
        if (params.thin < 3) { setThin(params.thin + 1); grace = 800; }
        else { auto = false; opts.onWeak?.(); }
      }
    }
  }

  function sync() {
    const should = visible && onScreen && !paused && !disposed;
    if (should && !running) { running = true; last = performance.now(); grace = Math.max(grace, 600); raf = requestAnimationFrame(tick); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
  }
  const onVis = () => { visible = document.visibilityState === 'visible'; sync(); };
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
  io.observe(container);
  onVis();
  draw(0);

  for (const pt of points) pt.y = (pt.altitude / relief.meta.zMax) * BASE_HEIGHT;

  return {
    params,
    setPaused(on) { paused = on; sync(); },
    dispose() {
      disposed = true;
      sync();
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMouse);
      contours.geometry.dispose(); border.geometry.dispose();
      lineMat.dispose(); borderMat.dispose();
      renderer.dispose();
      canvas.remove();
      if (opts.flat) opts.flat.style.opacity = '';
    },
  };
}
