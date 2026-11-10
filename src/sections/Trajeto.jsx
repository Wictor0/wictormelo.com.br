import { useT } from '../i18n.jsx';
import { trajeto } from '../data/content.js';
import { Strip } from '../components/Topo.jsx';
import Pic from '../components/Pic.jsx';

export default function Trajeto() {
  const t = useT();
  return (
    <section id="trajeto" className="sec" style={{ background: '#E6DECF' }}>
      <Strip viewBox="181.4 26.8 170 70" coords={['7°30\'43"S', '39°43\'26"W/']} n="04/05" mapColor="rgba(24,22,20,.75)" />
      <div className="wrap split">
        <div className="sticky">
          <p className="label" style={{ margin: '0 0 22px' }}>{t(trajeto.label)}</p>
          <h2 className="h2">{t(trajeto.title)}</h2>
          <div style={{ marginTop: 40, aspectRatio: '3 / 4', maxWidth: 420, overflow: 'hidden', background: '#C9C2B4' }}>
            <Pic className="ph" src="/assets/a28d9db6a358.jpg" sizes="(max-width: 900px) 100vw, 420px" alt={t(trajeto.photoAlt)} loading="lazy" />
          </div>
          <p className="mono" style={{ margin: '12px 0 0', fontSize: 10, opacity: 0.6 }}>{t(trajeto.photoCap)}</p>
        </div>
        <div>
          {trajeto.path.map((it, i) => (
            <div key={i} className="row rv">
              <span className="mono" style={{ fontSize: 11, color: '#B4271D' }}>{t(it.when)}</span>
              <div>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>{t(it.title)}</p>
                <p className="fell" style={{ margin: '4px 0 0', fontSize: 20, color: '#1E3540' }}>{it.org}</p>
                <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.6, opacity: 0.75 }}>{t(it.desc)}</p>
              </div>
              <span className="mono" style={{ fontSize: 10, opacity: 0.55 }}>{t(it.type)}</span>
            </div>
          ))}
          <p className="label" style={{ margin: '72px 0 10px' }}>{t(trajeto.awardsLabel)}</p>
          {trajeto.awards.map((a, i) => (
            <div key={i} className="row rv" style={{ gridTemplateColumns: '160px minmax(0,1fr) auto' }}>
              <span className="fell" style={{ fontSize: 30, color: a.c }}>{t(a.rank)}</span>
              <div>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{t(a.title)}</p>
                <p style={{ margin: '4px 0 0', fontSize: 15, opacity: 0.7 }}>{t(a.desc)}</p>
              </div>
              <span className="mono" style={{ fontSize: 10, opacity: 0.55 }}>{t(a.year)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
