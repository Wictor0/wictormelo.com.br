import { Fragment } from 'react';
import { useT, useLang } from '../i18n.jsx';
import { sobre, ui, CV_URL } from '../data/content.js';
import { TopoCrop } from '../components/Topo.jsx';

const B = '1.5px solid #181614';

function Manifesto() {
  const { lang } = useLang();
  const parts = sobre.manifesto[lang] || sobre.manifesto.pt;
  return (
    <p className="manifesto rv">
      {parts.map((p, i) => {
        if (p[0] === 't') return <Fragment key={i}>{p[1]}</Fragment>;
        if (p[0] === 'hl') return <span key={i} className="fell" style={{ fontWeight: 400, letterSpacing: 0, color: '#B4271D' }}>{p[1]}</span>;
        const [, word, img, w, pos, punct] = p;
        return (
          <span key={i} style={{ whiteSpace: 'nowrap' }}>
            {word}
            <span className="pill-img" style={{ width: `${w}em`, marginRight: '.06em' }}>
              <img className="ph" src={`/assets/${img}`} alt="" style={{ objectPosition: pos }} />
            </span>
            {punct}
          </span>
        );
      })}
    </p>
  );
}

export default function Sobre() {
  const t = useT();
  return (
    <section id="sobre" className="sec">
      <div className="wrap">
        <p className="label" style={{ margin: '0 0 28px' }}>{t(sobre.label)}</p>
        <div className="album-grid">
          <div className="rv album">
            <img className="ph" src="/assets/31f75be885fe.jpg" alt={t(sobre.photoAlt)} />
            <div className="album-ficha">
              <div style={{ position: 'relative', overflow: 'hidden', color: '#F4EFE6' }}><TopoCrop className="album-map" viewBox="841.9 70.7 190 84" /></div>
              <div className="mono" style={{ borderLeft: '1.5px solid currentColor', display: 'grid', gridTemplateRows: 'auto 1fr', fontSize: 10, lineHeight: 1.5 }}>
                <span style={{ padding: '8px 10px', borderBottom: '1.5px solid currentColor' }}>7°51'04"S<br />35°15'14"W/</span>
                <span style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  WICTOR MELO<br />{t(sobre.albumTag)}
                  <span className="fell" style={{ fontSize: 20, textTransform: 'none', letterSpacing: 0, alignSelf: 'flex-end' }}>wm</span>
                </span>
              </div>
            </div>
          </div>
          <div className="rv">
            <div className="mono" style={{ border: B, fontSize: 12, lineHeight: 1.5 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: B }}>
                <div style={{ padding: 16, fontFamily: "'Inter Tight', sans-serif", fontWeight: 600, fontSize: 26, letterSpacing: '-0.01em', textTransform: 'none' }}>Wictor Melo</div>
                <div style={{ borderLeft: B, padding: '12px 14px', fontSize: 11, maxWidth: 90 }}>{t(sobre.fichaTitle)}</div>
              </div>
              {sobre.ficha.map((r, i) => (
                <div key={i} className="ficha-row" style={{ borderBottom: i < sobre.ficha.length - 1 ? B : 0 }}>
                  <span style={{ opacity: 0.55 }}>{t(r.k)}</span>
                  <span dangerouslySetInnerHTML={{ __html: t(r.v) }} />
                </div>
              ))}
            </div>
            <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: 26, marginTop: 16, fontSize: 12 }}>
              <a className="lnk" href={t(CV_URL)} download style={{ color: '#B4271D' }}>{t(ui.cv)}</a>
              <a className="lnk" href="https://www.linkedin.com/in/wictormelo" target="_blank" rel="noopener">LinkedIn ↗</a>
              <a className="lnk" href="https://github.com/wictor0" target="_blank" rel="noopener">GitHub ↗</a>
            </div>
          </div>
        </div>
        <Manifesto />
        <div className="cols3 rv">
          {t(sobre.cols).map((c, i) => <p key={i} dangerouslySetInnerHTML={{ __html: c }} />)}
        </div>
      </div>
    </section>
  );
}
