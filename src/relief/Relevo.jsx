import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './relevo.css';

// Pernambuco em 3D, como um extra. A página mostra sempre o mapa 2D; o relevo
// abre em tela cheia quando alguém pede (o botão Explorar no Contato e o link
// do rodapé). O Three.js e os dados só são baixados nesse momento.

// Lugares marcados no modo explorar. Altitude em metros, lida no próprio
// heightmap do relevo (pe-height.png). Olinda e Recife ficam a 4 km uma da
// outra, então as hastes têm alturas diferentes para os nomes não se encostarem.
export const LUGARES = [
  { nome: 'Olinda', lat: -8.0089, lon: -34.8553, altitude: 13, haste: 52 },
  { nome: 'Recife', lat: -8.0476, lon: -34.877, altitude: 4, haste: 18 },
  { nome: 'Carpina', lat: -7.8508, lon: -35.2547, altitude: 166, haste: 34 },
];

const WIDTH = 2;

export const RELEVO_TEXT = {
  pt: { explore: 'Explorar', footer: 'Explore Pernambuco', title: 'Pernambuco · relevo', pageTitle: 'Pernambuco em 3D', close: 'Fechar', loading: 'Levantando o relevo…', hint: 'Arraste para girar e inclinar · pinça ou rolagem para aproximar' },
  en: { explore: 'Explore', footer: 'Explore Pernambuco', title: 'Pernambuco · relief', pageTitle: 'Pernambuco in 3D', close: 'Close', loading: 'Raising the relief…', hint: 'Drag to turn and tilt · pinch or scroll to zoom' },
};

// testa uma vez só: cada teste cria um contexto WebGL, e o navegador limita quantos existem
let webgl;
export function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      webgl = !!gl;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

// baixa o código e os dados uma vez só. Chamado também no hover e no toque do
// botão, para o relevo já estar a caminho quando o clique acontecer.
let loading;
export function prefetchRelevo() {
  if (!loading) {
    loading = Promise.all([import('./scene.js'), import('./loadRelief.js')])
      .then(async ([sceneMod, { loadRelief }]) => ({ sceneMod, relief: await loadRelief({ width: WIDTH, height: 0.35 }) }));
    loading.catch(() => { loading = null; });
  }
  return loading;
}

function useExploreScene(box, labelEls, onFail) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let dead = false;
    let api = null;
    prefetchRelevo()
      .then(({ sceneMod, relief }) => {
        if (dead || !box.current) return;
        const [w, s, e, n] = relief.meta.bbox;
        const points = LUGARES.map((l, i) => ({
          x: ((l.lon - w) / (e - w) - 0.5) * relief.size.x,
          z: (0.5 - (l.lat - s) / (n - s)) * relief.size.z,
          altitude: l.altitude,
          el: labelEls.current[i],
        }));
        api = sceneMod.createReliefScene(box.current, relief, { mode: 'explore', params: { thin: 1 }, points, onWeak: onFail });
        setReady(true);
      })
      .catch(() => { if (!dead) onFail(); });
    return () => { dead = true; api?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready;
}

export function Explorar({ onClose, text, page = false }) {
  const box = useRef(null);
  const labelEls = useRef([]);
  const closeBtn = useRef(null);
  const ready = useExploreScene(box, labelEls, onClose);

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
    // como página, fica por baixo da cortina azul da troca de página
    <div className={`rx${page ? ' rx-page' : ''}`} role="dialog" aria-modal="true" aria-label={text.title}>
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
      {!ready && <p className="rx-carrega mono" aria-live="polite">{text.loading}</p>}
      <p className="rx-dica mono">{text.hint}</p>
    </div>,
    document.body
  );
}

/**
 * Mapa do Contato: o SVG de sempre e o botão que abre o relevo.
 * @param {string}   viewBox  recorte do mapa
 * @param {string}   label    texto alternativo do mapa
 * @param {string}   cta      texto do botão
 * @param {function} onExplore
 */
export default function Relevo({ viewBox, label, cta, onExplore }) {
  const [can, setCan] = useState(false);
  useEffect(() => { setCan(hasWebGL()); }, []);
  return (
    <div className="relevo" style={{ aspectRatio: viewBox.split(/\s+/).slice(2).join(' / ') }}>
      <svg className="relevo-2d" role="img" aria-label={label} viewBox={viewBox}>
        <use href="#pe-topo" />
      </svg>
      {can && (
        <button type="button" className="relevo-btn mono" onClick={onExplore} onPointerEnter={prefetchRelevo} onFocus={prefetchRelevo} onTouchStart={prefetchRelevo}>
          {cta} ↗
        </button>
      )}
    </div>
  );
}
