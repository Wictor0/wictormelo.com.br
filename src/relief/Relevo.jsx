import { useEffect, useRef, useState } from 'react';
import { TopoDefs } from '../components/Topo.jsx';
import './relevo.css';

// Relevo 3D de Pernambuco com reserva silenciosa para o mapa 2D.
// O Three.js só é baixado se o 3D for mesmo rodar: sem WebGL, com aparelho
// fraco ou com "reduzir movimento", fica o <use href="#pe-topo"> de sempre.

// Os cinco lugares cujas coordenadas já aparecem no site. Altitude em metros,
// conferida no próprio heightmap do relevo (pe-height.png).
export const LUGARES = [
  { nome: 'Olinda', lat: -8.0089, lon: -34.8553, altitude: 13, haste: 14 },
  { nome: 'Carpina', lat: -7.8508, lon: -35.2547, altitude: 166, haste: 58 },
  { nome: 'Caruaru', lat: -8.2831, lon: -35.9761, altitude: 543, haste: 30 },
  { nome: 'Triunfo', lat: -7.8381, lon: -38.1011, altitude: 1034, haste: 22 },
  { nome: 'Exu', lat: -7.5119, lon: -39.7239, altitude: 517, haste: 26 },
];

const WIDTH = 2;
const FULL_VIEWBOX = '10 16 1005 352'; // o estado inteiro no topo-defs.svg

function can3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // pouca memória ou poucos núcleos: nem tenta
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

/**
 * @param {object} props
 * @param {object} [props.params]     ver DEFAULTS em scene.js; pode mudar ao vivo
 * @param {'auto'|'3d'|'2d'} [props.mode]  'auto' decide sozinho; os outros forçam (para teste)
 * @param {boolean} [props.auto]      deixa a cena reduzir curvas se cair de 30 fps
 * @param {boolean} [props.labels]    mostra os rótulos das cidades (desligado por padrão)
 * @param {function} [props.onParams] avisa quando o arrasto muda um parâmetro ({ angle })
 * @param {function} [props.onStats]  repassa fps/ms/linhas/pontos
 * @param {function} [props.onQuality] avisa quando o ajuste automático muda as curvas
 * @param {object} [props.apiRef]      recebe a cena ({ set, bench, dispose }) quando o 3D está de pé
 * @param {function} [props.onMode]   avisa qual modo acabou valendo ('3d' ou '2d')
 */
export default function Relevo({ params, mode = 'auto', auto = true, labels = false, onStats, onQuality, onMode, onParams, apiRef, className = '' }) {
  const [use3D, setUse3D] = useState(() => (mode === '2d' ? false : mode === '3d' ? hasWebGL() : can3D()));
  const [ready, setReady] = useState(false);
  const box = useRef(null);
  const scene = useRef(null);
  const labelEls = useRef([]);
  const cb = useRef({});
  cb.current = { onStats, onQuality, onMode, onParams };
  const first = useRef(params);

  useEffect(() => {
    setUse3D(mode === '2d' ? false : mode === '3d' ? hasWebGL() : can3D());
  }, [mode]);

  useEffect(() => { cb.current.onMode?.(use3D ? '3d' : '2d'); }, [use3D]);

  useEffect(() => {
    if (!use3D) return;
    let dead = false;
    setReady(false);
    Promise.all([import('./scene.js'), import('./loadRelief.js')])
      .then(async ([{ createReliefScene }, { loadRelief }]) => {
        const relief = await loadRelief({ width: WIDTH, height: 0.35 });
        if (dead) return;
        const [w, s, e, n] = relief.meta.bbox;
        const points = LUGARES.map((l, i) => ({
          x: ((l.lon - w) / (e - w) - 0.5) * relief.size.x,
          z: (0.5 - (l.lat - s) / (n - s)) * relief.size.z,
          altitude: l.altitude,
          el: labelEls.current[i],
        }));
        scene.current = createReliefScene(box.current, relief, {
          params: first.current,
          points,
          auto,
          onStats: (st) => cb.current.onStats?.(st),
          onQuality: (t) => cb.current.onQuality?.(t),
          onParams: (p) => cb.current.onParams?.(p),
          onWeak: () => setUse3D(false),
        });
        if (apiRef) apiRef.current = scene.current;
        setReady(true);
      })
      .catch(() => { if (!dead) setUse3D(false); }); // qualquer falha cai no 2D
    return () => { dead = true; scene.current?.dispose(); scene.current = null; if (apiRef) apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [use3D]);

  useEffect(() => { first.current = params; if (params) scene.current?.set(params); }, [params]);
  useEffect(() => { scene.current?.setAuto(auto); }, [auto]);

  return (
    <div className={`relevo ${className}`}>
      <TopoDefs />
      {/* o 2D fica por baixo até o 3D desenhar o primeiro quadro, e é a reserva */}
      <svg
        className="relevo-2d"
        role="img"
        aria-label="Mapa topográfico de Pernambuco"
        viewBox={FULL_VIEWBOX}
        style={{ opacity: use3D && ready ? 0 : use3D ? 0.25 : 1 }}
      >
        <use href="#pe-topo" />
      </svg>
      {use3D && (
        <div ref={box} className="relevo-3d" style={{ opacity: ready ? 1 : 0 }} aria-hidden="true">
          {labels && LUGARES.map((l, i) => (
            <div key={l.nome} ref={(el) => { labelEls.current[i] = el; }} className="relevo-pt">
              <i style={{ height: l.haste }} />
              <span style={{ bottom: l.haste + 3 }}>{l.nome}<small>{l.altitude} m</small></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
