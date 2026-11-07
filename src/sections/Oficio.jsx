import { useMemo } from 'react';
import { useT } from '../i18n.jsx';
import { oficio } from '../data/content.js';
import { Strip } from '../components/Topo.jsx';

const V = [
  ['radial-gradient(circle at 0% 50%, transparent 0 34%, C 35% 52%, transparent 53%)', 'none'],
  ['C', 'circle(46% at 100% 50%)'],
  ['C', 'polygon(0 30%,48% 30%,68% 55%,100% 55%,100% 82%,58% 82%,38% 57%,0 57%)'],
  ['C', 'polygon(22% 0,62% 0,62% 42%,100% 42%,100% 72%,0 72%,0 42%,22% 42%)'],
  ['C', 'polygon(0 0,100% 0,0 100%)'],
  ['radial-gradient(circle at 50% 100%, transparent 0 40%, C 41% 57%, transparent 58%)', 'none'],
  ['C', 'polygon(0 34%,100% 18%,100% 48%,0 64%)'],
];

// 36 azulejos sorteados a cada visita
function useTiles(n = 36) {
  return useMemo(() => Array.from({ length: n }, () => {
    const [bg, clip] = V[Math.floor(Math.random() * V.length)];
    return { bg: bg.replace('C', Math.random() < 0.1 ? '#B4271D' : '#24485A'), clip, rot: [0, 90, 180, 270][Math.floor(Math.random() * 4)] };
  }), [n]);
}

export default function Oficio() {
  const t = useT();
  const tiles = useTiles();
  return (
    <section id="oficio" className="sec dark" style={{ background: '#1E3540', color: '#EFE6D6' }}>
      <Strip viewBox="424.9 75.7 170 70" coords={['7°50\'17"S', '38°06\'04"W/']} n="03/05" mapColor="rgba(239,230,214,.8)" />
      <div className="wrap">
        <p className="label" style={{ margin: '0 0 22px', color: '#EAD9BA' }}>{t(oficio.label)}</p>
        <div className="sec-head">
          <h2 className="h2">{t(oficio.title)} <span className="fell" style={{ fontWeight: 400, letterSpacing: 0, color: '#EAD9BA' }}>{t(oficio.titleFell)}</span></h2>
          <p className="sec-sub">{t(oficio.sub)}</p>
        </div>
        <div className="ofi rv">
          <div className="pz-cell az-cell" aria-hidden="true">
            {tiles.map((x, i) => (
              <div key={i} className="tile az"><div style={{ position: 'absolute', inset: 0, background: x.bg, clipPath: x.clip, transform: `rotate(${x.rot}deg)` }} /></div>
            ))}
          </div>
          {oficio.skills.map((k) => (
            <div key={k.n} className="sk">
              <p className="mono" style={{ margin: 0, fontSize: 10, color: '#EAD9BA' }}>{k.n}</p>
              <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{t(k.title)}</p>
              <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.55, opacity: 0.75 }}>{t(k.items)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
