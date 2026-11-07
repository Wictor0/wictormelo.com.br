import { useEffect, useState } from 'react';

// Carrega uma única vez o mapa topográfico de Pernambuco (id #pe-topo) de
// public/topo-defs.svg. Os recortes usam <use href="#pe-topo"> com viewBox diferentes.
export function TopoDefs() {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    fetch('/topo-defs.svg').then((r) => r.text()).then(setSvg).catch(() => {});
  }, []);
  return <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function TopoCrop({ viewBox, label, slice = true, style, className }) {
  return (
    <svg
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      viewBox={viewBox}
      preserveAspectRatio={slice ? 'xMidYMid slice' : undefined}
      style={{ display: 'block', width: '100%', height: slice ? '100%' : 'auto', ...style }}
    >
      <use href="#pe-topo" />
    </svg>
  );
}

export const STAR = '50,4 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38';

export function Star({ size = 18, fill = 'currentColor' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <polygon points={STAR} fill={fill} />
    </svg>
  );
}

// Faixa entre seções: recorte do mapa + coordenadas + número da seção
export function Strip({ viewBox, coords, n, mapColor }) {
  return (
    <div className="wrap" style={{ marginBottom: 56 }}>
      <div className="rv mstack strip">
        <div style={{ color: mapColor, overflow: 'hidden' }}><TopoCrop viewBox={viewBox} /></div>
        <div className="mono strip-info">
          <span style={{ padding: '10px 14px', borderBottom: '1.5px solid currentColor', lineHeight: 1.5 }}>{coords[0]}<br />{coords[1]}</span>
          <span style={{ padding: '10px 14px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}><span style={{ color: '#B4271D' }}>{n}</span></span>
        </div>
      </div>
    </div>
  );
}
