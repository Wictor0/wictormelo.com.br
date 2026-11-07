import { useT } from '../i18n.jsx';
import { galeria } from '../data/content.js';

export default function Galeria() {
  const t = useT();
  return (
    <section aria-label="Galeria" className="no-save" style={{ padding: 'clamp(80px, 10vw, 130px) 0 0' }}>
      <div className="wrap">
        <div className="mos" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gridTemplateRows: 'repeat(4, clamp(120px, 14.5vw, 210px))', gap: 8 }}>
          {galeria.map((g, i) => (
            <div key={i} className="mos-cell rv" style={{ gridColumn: g.col, gridRow: g.row, position: 'relative', overflow: 'hidden', background: g.bg || '#D9D0C0' }}>
              <img className="ph" src={g.src} alt={t(g.alt)} loading="lazy" draggable={false} />
              <span className="mono" style={{ position: 'absolute', left: 10, bottom: 8, fontSize: 10, color: '#EEE5D3' }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
