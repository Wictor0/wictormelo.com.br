import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useT } from '../i18n.jsx';
import { obras, ui } from '../data/content.js';
import { Strip } from '../components/Topo.jsx';
import Pic from '../components/Pic.jsx';

function Logo({ row }) {
  const l = row.logo;
  if (!l) return <span className="rname" style={{ display: 'flex', alignItems: 'center', height: 52, fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em' }}>{row.name}</span>;
  return (
    <span style={{ display: 'flex', alignItems: 'center', height: 52 }}>
      <span className="lgw" role="img" aria-label={row.name} style={{ height: l.h, aspectRatio: l.ar, maxWidth: 190 }}>
        {l.mask
          ? <span className={`lg ${l.mask}`} aria-hidden="true" />
          : <img className="lg" src={l.dark} alt="" style={{ background: 'transparent', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} />}
        <img className="lc" src={l.color} alt="" />
      </span>
    </span>
  );
}

// Celular: carrossel de cards com a capa e o logo colorido, sem depender de hover
function Slider({ t }) {
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const n = obras.rows.length;
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const card = el.firstElementChild; if (!card) return;
    setI(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
  };
  const go = (d) => {
    const el = ref.current; const card = el?.firstElementChild; if (!card) return;
    el.scrollBy({ left: d * (card.offsetWidth + 12), behavior: 'smooth' });
  };
  return (
    <div className="obras-slider">
      <div className="os-track" ref={ref} onScroll={onScroll}>
        {obras.rows.map((r, k) => {
          return (
            <Link key={r.slug} to={`/obras/${r.slug}`} className="os-card" style={{ '--c': r.c }}>
              <div className="os-cover" style={{ background: '#E6DECF' }}>
                {r.thumb && <Pic src={r.thumb} sizes="(max-width: 480px) 82vw, 380px" alt="" loading="lazy" draggable={false} />}
              </div>
              <div className="os-body">
                <div className="os-top mono"><span>{String(k + 1).padStart(2, '0')}</span><span>{t(r.period)}</span></div>
                <div className="os-logo">
                  {r.logo ? <img src={r.logo.color} alt={r.name} style={{ height: Math.round(r.logo.h * 1.15) }} /> : <span className="os-name">{r.name}</span>}
                </div>
                <p className="fell os-type">{t(r.type)}</p>
                <div className="os-foot mono"><span>{t(r.role)}</span><span className="os-open">{t(ui.open)}</span></div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="os-nav mono">
        <button type="button" onClick={() => go(-1)} disabled={i <= 0} aria-label="Anterior">←</button>
        <span>{String(Math.min(i + 1, n)).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <button type="button" onClick={() => go(1)} disabled={i >= n - 1} aria-label="Próximo">→</button>
      </div>
    </div>
  );
}

export default function Obras() {
  const t = useT();
  const cols = t(obras.cols);
  return (
    <section id="obras" className="sec" style={{ paddingTop: 0 }}>
      <Strip viewBox="743.6 142.4 170 70" coords={['8°16\'59"S', '35°58\'34"W/']} n="02/05" mapColor="rgba(24,22,20,.75)" />
      <div className="wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 48 }}>
          <div><p className="label" style={{ margin: '0 0 22px' }}>{t(obras.label)}</p><h2 className="h2">{t(obras.title)}</h2></div>
          <p className="mono" style={{ margin: 0, fontSize: 11, opacity: 0.55 }}>{t(obras.meta)}</p>
        </div>
        <Slider t={t} />
        <div className="obras-table">
        <div className="mono idx" style={{ fontSize: 10, opacity: 0.55, paddingBottom: 10 }}>
          <span>{cols[0]}</span><span>{cols[1]}</span><span className="hide-m">{cols[2]}</span><span className="hide-m">{cols[3]}</span><span className="hide-m">{cols[4]}</span><span />
        </div>
        {obras.rows.map((r, i) => (
          <Link key={r.slug} className="row idx idx-row" to={`/obras/${r.slug}`} style={{ '--c': r.c }}>
            <span className="mono" style={{ fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
            <Logo row={r} />
            <span className="fell hide-m" style={{ fontSize: 20 }}>{t(r.type)}</span>
            <span className="mono hide-m" style={{ fontSize: 10, opacity: 0.7 }}>{t(r.role)}</span>
            <span className="mono hide-m" style={{ fontSize: 11 }}>{t(r.period)}</span>
            <span className="mono" style={{ fontSize: 11, textAlign: 'right', color: '#B4271D' }}>{t(ui.open)}</span>
          </Link>
        ))}
        <div style={{ borderTop: '1.5px solid #181614' }} />
        </div>
      </div>
    </section>
  );
}
