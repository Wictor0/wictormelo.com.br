import { useT } from '../i18n.jsx';
import Logo from '../components/Logo.jsx';
import Pic from '../components/Pic.jsx';
import { contato, ui, CV_URL } from '../data/content.js';
import { TopoCrop, Star, STAR } from '../components/Topo.jsx';

const stars = [
  { x: 37, y: 50, size: 28, fill: '#F4EFE6', d: 0 }, { x: 50, y: 14, size: 34, fill: '#F4EFE6', d: 1.2 }, { x: 63, y: 50, size: 28, fill: '#F4EFE6', d: 0.6 },
  { x: 8, y: 70, size: 10, fill: '#D2A04A', d: 2 }, { x: 18, y: 180, size: 8, fill: '#F4EFE6', d: 0.4 }, { x: 26, y: 30, size: 12, fill: '#D2A04A', d: 1.6 },
  { x: 80, y: 110, size: 9, fill: '#F4EFE6', d: 2.4 }, { x: 90, y: 40, size: 12, fill: '#D2A04A', d: 0.9 }, { x: 74, y: 210, size: 7, fill: '#F4EFE6', d: 2.8 },
  { x: 12, y: 260, size: 7, fill: '#F4EFE6', d: 1.1 }, { x: 88, y: 240, size: 8, fill: '#D2A04A', d: 3.2 },
];

// Sol da bandeira de 1817
const sun = (() => {
  let s = 17; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pts = [];
  for (let i = 0; i < 44; i++) {
    const a = (Math.PI * i) / 22; const rr = i % 2 === 0 ? 44 + r() * 5 : 29 + r() * 2;
    pts.push((50 + rr * Math.cos(a)).toFixed(1) + ',' + (50 + rr * Math.sin(a)).toFixed(1));
  }
  return pts.join(' ');
})();

export default function Contato() {
  const t = useT();
  return (
    <>
      <section id="contato" className="dark" style={{ position: 'relative', marginTop: 'clamp(80px, 10vw, 140px)', background: '#1E3540', color: '#F4EFE6', overflow: 'hidden' }}>
        <div className="wrap split" style={{ paddingTop: 'clamp(90px, 10vw, 140px)', alignItems: 'center' }}>
          <div>
            <p className="label" style={{ margin: '0 0 22px', color: '#D2A04A' }}>{t(contato.label)}</p>
            <h2 className="h2">{t(contato.title)} <span className="fell" style={{ display: 'block', fontWeight: 400, letterSpacing: 0, color: '#D2A04A' }}>{t(contato.titleFell)}</span></h2>
            <a className="lnk" href={`mailto:${contato.email}`} style={{ marginTop: 32, fontSize: 'clamp(22px, 2.6vw, 38px)', fontWeight: 500, letterSpacing: '-0.02em' }}>{contato.email} ↗</a>
            <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: 28, marginTop: 18, fontSize: 12 }}>
              {contato.links.map((l) => <a key={l.href} className="lnk" href={l.href} target="_blank" rel="noopener">{l.label}</a>)}
              <a className="lnk cv" href={t(CV_URL)} download>{t(ui.cv)}</a>
            </div>
          </div>
          <div className="rv" style={{ aspectRatio: '4 / 5', maxWidth: 380, justifySelf: 'end', width: '100%', overflow: 'hidden', background: '#2B393E' }}>
            <Pic className="ph" src="/assets/5c7f569f1f37.jpg" sizes="(max-width: 900px) 100vw, 380px" alt={t(contato.photoAlt)} loading="lazy" style={{ objectPosition: '60% 40%' }} />
          </div>
        </div>
        <div className="wrap" style={{ marginTop: 90 }}>
          <div className="rv mstack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', border: '1.5px solid currentColor' }}>
            <div style={{ padding: '20px 24px', color: '#F4EFE6' }}><TopoCrop viewBox="5 10 1015 363" slice={false} label={t(contato.peAlt)} /></div>
            <div className="mono" style={{ borderLeft: '1.5px solid currentColor', display: 'grid', gridTemplateRows: 'auto auto 1fr auto', fontSize: 12 }}>
              <span style={{ padding: '14px 16px', borderBottom: '1.5px solid currentColor', fontSize: 15, lineHeight: 1.5 }}>8°19'00"S<br />37°53'00"W/</span>
              <span style={{ padding: '14px 16px', borderBottom: '1.5px solid currentColor', fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 24, letterSpacing: 0 }}>PERNAMBUCO</span>
              <span style={{ padding: '14px 16px', lineHeight: 1.7, opacity: 0.85 }}>{t(contato.peLine)}<br />Wictor Melo/ 26/</span>
              <span style={{ padding: '12px 16px', borderTop: '1.5px solid currentColor', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Star /><Logo height={17} label="WM" />
              </span>
            </div>
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'relative', height: 540, marginTop: 40 }}>
          {stars.map((s, i) => (
            <svg key={i} className="tw" viewBox="0 0 100 100" style={{ position: 'absolute', zIndex: 1, left: `${s.x}%`, top: s.y, width: s.size, height: s.size, marginLeft: -s.size / 2, animationDelay: `${s.d}s` }}>
              <polygon points={STAR} fill={s.fill} />
            </svg>
          ))}
          <div style={{ position: 'absolute', left: '50%', bottom: 110, width: 'clamp(280px, 42vw, 600px)', transform: 'translateX(-50%)' }}>
            <svg viewBox="0 0 400 205" style={{ display: 'block', width: '100%' }}>
              <path d="M 18 205 A 182 182 0 0 1 382 205" fill="none" stroke="#B4271D" strokeWidth="22" />
              <path d="M 40 205 A 160 160 0 0 1 360 205" fill="none" stroke="#D2A04A" strokeWidth="22" />
              <path d="M 62 205 A 138 138 0 0 1 338 205" fill="none" stroke="#F4EFE6" strokeWidth="22" />
            </svg>
            <div style={{ position: 'absolute', left: '50%', bottom: 0, width: '34%', aspectRatio: '1 / 1', transform: 'translate(-50%, 40%)' }}>
              <svg className="spin" viewBox="0 0 100 100" style={{ display: 'block', width: '100%', height: '100%' }}>
                <polygon points={sun} fill="#D2A04A" /><circle cx="50" cy="50" r="22" fill="#D9AC55" />
              </svg>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: '#EEE5D3' }} />
        </div>
      </section>
      <footer style={{ background: '#EEE5D3' }}>
        <div className="wrap mono" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingTop: 6, paddingBottom: 28, fontSize: 10 }}>
          <span>8°00'32"S 34°51'18"W/</span><span>© 2026 Wictor Melo</span><a className="lnk" href="#topo" style={{ minHeight: 0 }}>{t(ui.top)}</a>
        </div>
      </footer>
    </>
  );
}
