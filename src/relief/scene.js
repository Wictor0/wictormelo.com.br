// Cena 3D do relevo de Pernambuco. Este arquivo é o único que importa o
// Three.js e só entra por import() dinâmico (ver Relevo.jsx), então nada
// daqui pesa no carregamento inicial do site.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Fog, Color, Vector3, MathUtils,
} from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { thinLevels } from './loadRelief.js';

const BEGE = 0xeee5d3;
const AZUL = 0x1e3540;
const BASE_HEIGHT = 0.35; // altura com que o relevo é carregado; o exagero vira escala em Y
const FOV = 28;

export const DEFAULTS = {
  height: 0.13,     // exagero vertical, em unidades de cena (largura do mapa = 2)
  thin: 1,          // 1 = todas as curvas, 2 = uma a cada 100 m, 3 = a cada 150 m
  speed: 3,         // giro, em graus por segundo
  angle: 40,        // elevação da câmera, em graus
  zoom: 1,
  borderWidth: 1.5, // px
  lineWidth: 0.75,  // px
  depth: 0.45,      // 0 = sem esmaecer o fundo, 1 = fundo quase some
  tilt: 1,          // quanto o mouse/giroscópio inclina
};

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
  return { array: out, count: n };
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
 * @param {object} [opts.params]   ver DEFAULTS
 * @param {Array}  [opts.points]   [{ x, z, altitude, el }] rótulos HTML a posicionar
 * @param {boolean} [opts.auto]    reduz as curvas sozinho se ficar abaixo de 30 fps
 * @param {function} [opts.onParams]  ({ angle }) quando o arrasto muda um parâmetro
 * @param {function} [opts.onStats]   ({ fps, ms, lines, points, thin }) a cada 0,5 s
 * @param {function} [opts.onQuality] (thin) quando o ajuste automático reduz as curvas
 * @param {function} [opts.onWeak]    quando nem o nível mais leve segura 30 fps
 */
export function createReliefScene(container, relief, opts = {}) {
  const params = { ...DEFAULTS, ...opts.params };
  const points = opts.points || [];
  let auto = opts.auto !== false;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(AZUL, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  container.appendChild(canvas);

  const scene = new Scene();
  scene.fog = new Fog(new Color(AZUL), 1, 10);
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  const group = new Group();
  scene.add(group);

  const common = { color: BEGE, transparent: true, depthTest: false, depthWrite: false, fog: true };
  const lineMat = new LineMaterial({ ...common, linewidth: params.lineWidth, opacity: 0.85 });
  const borderMat = new LineMaterial({ ...common, linewidth: params.borderWidth, opacity: 1 });
  const contours = makeLines(lineMat);
  const border = makeLines(borderMat);
  border.renderOrder = 1;
  group.add(contours, border);

  border.geometry.setPositions(segments(relief.lines.filter((l) => l.isBorder)).array);

  const counts = { lines: 0, points: 0 };
  function setThin(n) {
    params.thin = n;
    const kept = (n > 1 ? thinLevels(relief, n) : relief.lines);
    const curves = kept.filter((l) => !l.isBorder);
    // LineSegmentsGeometry não reaproveita o buffer quando o tamanho muda
    contours.geometry.dispose();
    contours.geometry = new LineSegmentsGeometry();
    contours.geometry.setPositions(segments(curves).array);
    counts.lines = kept.length;
    counts.points = kept.reduce((s, l) => s + l.positions.length / 3, 0);
  }
  setThin(params.thin);

  // ---- tamanho ----
  let w = 1, h = 1;
  function resize() {
    w = Math.max(1, container.clientWidth);
    h = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); if (!running) draw(0); });
  ro.observe(container);
  resize();

  // ---- inclinação: mouse no computador, giroscópio no celular ----
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMouse = (e) => {
    if (drag || (e.pointerType && e.pointerType !== 'mouse')) return;
    tilt.tx = MathUtils.clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
    tilt.ty = MathUtils.clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
  };
  window.addEventListener('pointermove', onMouse, { passive: true });

  // ---- arrastar: na horizontal gira o mapa; na vertical (só mouse) muda a
  // elevação da câmera. No toque o gesto vertical continua rolando a página.
  let drag = null;
  const onDown = (e) => {
    if (e.button) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    canvas.style.cursor = 'grabbing';
  };
  const onDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    az += ((e.clientX - drag.x) / Math.max(320, w)) * Math.PI * 1.2;
    if (e.pointerType === 'mouse') {
      const a = MathUtils.clamp(params.angle + (e.clientY - drag.y) * 0.25, 5, 80);
      if (a !== params.angle) { params.angle = a; opts.onParams?.({ angle: a }); }
    }
    drag.x = e.clientX; drag.y = e.clientY;
    if (!running && !disposed) draw(0);
  };
  const onUp = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onDrag);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  let gyroBase = null;
  const onGyro = (e) => {
    if (e.beta == null || e.gamma == null) return;
    if (!gyroBase) gyroBase = { b: e.beta, g: e.gamma };
    tilt.tx = MathUtils.clamp((e.gamma - gyroBase.g) / 25, -1, 1);
    tilt.ty = MathUtils.clamp((e.beta - gyroBase.b) / 25, -1, 1);
  };
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const DOE = window.DeviceOrientationEvent;
  let askGyro = null;
  if (coarse && DOE) {
    if (typeof DOE.requestPermission === 'function') {
      // iOS só libera depois de um toque; se a pessoa negar, fica sem inclinação
      askGyro = () => {
        DOE.requestPermission()
          .then((r) => { if (r === 'granted') window.addEventListener('deviceorientation', onGyro); })
          .catch(() => {});
      };
      canvas.addEventListener('click', askGyro, { once: true });
    } else {
      window.addEventListener('deviceorientation', onGyro);
    }
  }

  // ---- laço ----
  const target = new Vector3();
  const v = new Vector3();
  let az = -0.35; // começa um pouco girado, com o litoral à direita
  let raf = 0, running = false, last = 0;
  let visible = true, onScreen = true, disposed = false;

  // medição: fps pelo intervalo entre quadros, ms pelo custo de CPU do quadro
  let accT = 0, accN = 0, accMs = 0;
  let slowT = 0, slowN = 0, grace = 1500;

  function draw(dt) {
    tilt.x += (tilt.tx - tilt.x) * Math.min(1, dt * 3);
    tilt.y += (tilt.ty - tilt.y) * Math.min(1, dt * 3);
    if (!drag) az += MathUtils.degToRad(params.speed) * dt; // segurando, o giro espera

    const sy = params.height / BASE_HEIGHT;
    group.scale.y = sy;
    group.rotation.y = az + MathUtils.degToRad(tilt.x * 7 * params.tilt);

    // distância para o mapa (raio ~1,07) caber em qualquer giro, na largura e na altura
    const el = MathUtils.degToRad(MathUtils.clamp(params.angle - tilt.y * 4 * params.tilt, 3, 88));
    const vf = MathUtils.degToRad(FOV) / 2;
    const hf = Math.atan(Math.tan(vf) * camera.aspect);
    const dist = Math.max(1.12 / Math.tan(hf), 0.62 / Math.tan(vf)) / params.zoom;
    target.set(0, params.height * 0.3, 0);
    camera.position.set(0, target.y + Math.sin(el) * dist, Math.cos(el) * dist);
    camera.lookAt(target);

    scene.fog.near = dist - 1.1 + (1 - params.depth) * 4;
    scene.fog.far = dist + 1.1 + (1 - params.depth) * 12 + 0.6;
    lineMat.linewidth = params.lineWidth;
    borderMat.linewidth = params.borderWidth;

    renderer.render(scene, camera);

    // rótulos: projeta cada ponto na tela e move o elemento HTML
    for (const p of points) {
      if (!p.el) continue;
      v.set(p.x, p.y, p.z).applyMatrix4(group.matrixWorld);
      const d = camera.position.distanceTo(v);
      v.project(camera);
      const px = (v.x * 0.5 + 0.5) * w;
      const py = (-v.y * 0.5 + 0.5) * h;
      p.el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
      // quem está do lado de trás do giro fica mais apagado
      p.el.style.opacity = (0.55 + 0.45 * MathUtils.clamp((dist + 1 - d) / 2, 0, 1)).toFixed(2);
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dtMs = now - last;
    last = now;
    if (dtMs > 250) { draw(0); return; } // voltou de uma pausa: não conta
    const t0 = performance.now();
    draw(dtMs / 1000);
    accMs += performance.now() - t0;
    accT += dtMs; accN++;

    if (accT >= 500) {
      opts.onStats?.({ fps: (accN * 1000) / accT, ms: accMs / accN, thin: params.thin, ...counts });
      accT = 0; accN = 0; accMs = 0;
    }

    // requisito: acima de 30 fps. Primeiro corta curvas, depois desiste do 3D.
    if (!auto) return;
    if (grace > 0) { grace -= dtMs; return; }
    slowT += dtMs; slowN++;
    if (slowT >= 2000) {
      const fps = (slowN * 1000) / slowT;
      slowT = 0; slowN = 0;
      if (fps < 30) {
        if (params.thin < 3) { setThin(params.thin + 1); grace = 800; opts.onQuality?.(params.thin); }
        else { auto = false; opts.onWeak?.(); }
      }
    }
  }

  function sync() {
    const should = visible && onScreen && !disposed;
    if (should && !running) { running = true; last = performance.now(); grace = Math.max(grace, 600); raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
  }
  const onVis = () => { visible = document.visibilityState === 'visible'; sync(); };
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
  io.observe(container);
  onVis();

  for (const p of points) p.y = (p.altitude / relief.meta.zMax) * BASE_HEIGHT;

  return {
    params,
    set(next) {
      if (next.thin != null && next.thin !== params.thin) setThin(next.thin);
      Object.assign(params, next);
      if (!running && !disposed) draw(0);
    },
    setAuto(on) { auto = on; slowT = 0; slowN = 0; grace = 800; },
    // Custo real de um quadro, sem o teto de 60 Hz da tela: desenha `n` quadros
    // seguidos e lê um pixel de volta, o que obriga a placa a terminar o trabalho.
    bench(n = 120) {
      const gl = renderer.getContext();
      const px = new Uint8Array(4);
      const run = (k) => {
        const t0 = performance.now();
        for (let i = 0; i < k; i++) { draw(1 / 60); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
        return (performance.now() - t0) / k;
      };
      run(10); // aquece
      const ms = run(n);
      return { ms, fps: 1000 / ms, thin: params.thin, ...counts, width: canvas.width, height: canvas.height };
    },
    dispose() {
      disposed = true;
      sync();
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMouse);
      window.removeEventListener('deviceorientation', onGyro);
      if (askGyro) canvas.removeEventListener('click', askGyro);
      contours.geometry.dispose(); border.geometry.dispose();
      lineMat.dispose(); borderMat.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
