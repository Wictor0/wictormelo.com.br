import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './relevo.css';

// Relevo 3D de Pernambuco, com reserva silenciosa para o mapa 2D.
//
// No Contato ele começa idêntico ao SVG plano do site e levanta com a rolagem.
// O Three.js só é baixado quando o mapa se aproxima da tela e se o 3D for mesmo
// rodar: sem WebGL, com aparelho fraco ou com "reduzir movimento", fica o
// <use href="#pe-topo"> de sempre. "Explorar" abre o relevo em tela cheia.

// Lugares marcados no modo explorar. Altitude em metros, lida no próprio
// heightmap do relevo (pe-height.png). Olinda e Recife ficam a 4 km uma da
// outra, então as hastes têm alturas diferentes para os nomes não se encostarem.
export const LUGARES = [
  { nome: 'Olinda', lat: -8.0089, lon: -34.8553, altitude: 13, haste: 52 },
  { nome: 'Recife', lat: -8.0476, lon: -34.877, altitude: 4, haste: 18 },
  { nome: 'Carpina', lat: -7.8508, lon: -35.2547, altitude: 166, haste: 34 },
];

const WIDTH = 2;
// o topo-defs.svg usa 150 unidades por grau a partir do canto noroeste do relevo;
// a cena usa 2 unidades para os 6,8° de largura: 1 unidade de cena = 510 do SVG
const SVG_PER_UNIT = 510;

// Para testar no computador sem placa: ?relevo=3d força, ?relevo=2d desliga
function forced() {
  try { return new URLSearchParams(window.location.search).get('relevo'); } catch { return null; }
}

function can3D() {
  const f = forced();
  if (f === '2d') return false;
  if (f === '3d') return hasWebGL();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false;
  try {
    // failIfMajorPerformanceCaveat recusa WebGL por software, que seria lento
    const c = document.createElement('canvas');
    const o = { failIfMajorPerformanceCaveat: true };
    return !!(c.getContext('webgl2', o) || c.getContext('webgl', o));
  } catch {
    return false;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// baixa o código e os dados uma vez só, para o Contato e o Explorar
let loading;
function loadAll() {
  if (!loading) {
    loading = Promise.all([import('./scene.js'), import('./loadRelief.js')])
      .then(async ([sceneMod, { loadRelief }]) => ({ sceneMod, relief: await loadRelief({ width: WIDTH, height: 0.35 }) }));
    loading.catch(() => { loading = null; });
  }
  return loading;
}

function frameFromViewBox(viewBox) {
  const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
  return {
    cx: (x + w / 2) / SVG_PER_UNIT - 1,
    cz: (y + h / 2) / SVG_PER_UNIT - 375 / SVG_PER_UNIT / 2,
    w: w / SVG_PER_UNIT,
    h: h / SVG_PER_UNIT,
  };
}

// monta uma cena num container e desmonta junto com ele
function useScene(box, { mode, frame, labels, labelEls, flat, onWeak, active = true }) {
  const api = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!active) return;
    let dead = false;
    loadAll()
      .then(({ sceneMod, relief }) => {
        if (dead || !box.current) return;
        const [w, s, e, n] = relief.meta.bbox;
        const points = labels
          ? LUGARES.map((l, i) => ({
              x: ((l.lon - w) / (e - w) - 0.5) * relief.size.x,
              z: (0.5 - (l.lat - s) / (n - s)) * relief.size.z,
              altitude: l.altitude,
              el: labelEls.current[i],
            }))
          : [];
        // no Contato o mapa é pequeno: uma curva a cada 100 m lê melhor; no Explorar, todas
        const params = { thin: mode === 'explore' ? 1 : 2 };
        api.current = sceneMod.createReliefScene(box.current, relief, { mode, frame, params, points, flat: flat?.current, onWeak });
        setReady(true);
      })
      .catch(() => { if (!dead) onWeak?.(); });
    return () => { dead = true; api.current?.dispose(); api.current = null; setReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return [ready, api];
}

function Explorar({ onClose, text }) {
  const box = useRef(null);
  const labelEls = useRef([]);
  const closeBtn = useRef(null);
  const [ready] = useScene(box, { mode: 'explore', labels: true, labelEls, onWeak: onClose });

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    closeBtn.current?.focus();
    return () => { html.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <div className="rx" role="dialog" aria-modal="true" aria-label={text.title}>
      <div ref={box} className="rx-cena" style={{ opacity: ready ? 1 : 0 }}>
        {LUGARES.map((l, i) => (
          <div key={l.nome} ref={(el) => { labelEls.current[i] = el; }} className="relevo-pt">
            <i style={{ height: l.haste }} />
            <span style={{ bottom: l.haste + 3 }}>{l.nome}<small>{l.altitude} m</small></span>
          </div>
        ))}
      </div>
      <div className="rx-topo mono">
        <span>{text.title}</span>
        <button ref={closeBtn} type="button" className="rx-btn" onClick={onClose}>{text.close} ✕</button>
      </div>
      <p className="rx-dica mono">{text.hint}</p>
    </div>,
    document.body
  );
}

/**
 * Mapa do Contato.
 * @param {string} viewBox  o mesmo recorte do SVG que aparece no lugar (reserva e estado plano)
 * @param {string} label    texto alternativo do mapa
 * @param {object} text     { explore, title, close, hint } já no idioma da página
 */
export default function Relevo({ viewBox, label, text }) {
  const [use3D, setUse3D] = useState(false);
  const [near, setNear] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const box = useRef(null);
  const frame = useRef(frameFromViewBox(viewBox));
  const flat = useRef(null);

  // decide e só baixa quando o mapa estiver a ~1 tela de distância
  useEffect(() => {
    if (!can3D()) return;
    setUse3D(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '100% 0px' });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const [ready, api] = useScene(box, { mode: 'inline', frame: frame.current, flat, active: use3D && near, onWeak: () => setUse3D(false) });

  // com o Explorar aberto, o do Contato para de desenhar
  useEffect(() => { api.current?.setPaused(open); }, [open, ready, api]);

  const close = useCallback(() => setOpen(false), []);
  const openExplore = () => {
    setOpen(true);
    try { window.umami?.track('Explorou o relevo'); } catch {}
  };

  return (
    <div ref={wrap} className="relevo" style={{ aspectRatio: viewBox.split(/\s+/).slice(2).join(' / ') }}>
      {/* o 2D fica por baixo: é a reserva e é o estado plano; a cena troca um pelo outro */}
      <svg ref={flat} className="relevo-2d" role="img" aria-label={label} viewBox={viewBox}>
        <use href="#pe-topo" />
      </svg>
      {use3D && near && <div ref={box} className="relevo-3d" aria-hidden="true" />}
      {ready && (
        <button type="button" className="relevo-btn mono" onClick={openExplore}>{text.explore} ↗</button>
      )}
      {open && <Explorar text={text} onClose={close} />}
    </div>
  );
}
