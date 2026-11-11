import { Link, useParams, Navigate } from 'react-router-dom';
import { useEffect, useLayoutEffect } from 'react';
import { startMorph, finishMorph } from '../morph.js';
import { useT, LangSwitch } from '../i18n.jsx';
import { caseBySlug } from '../data/cases.js';
import { obras, ui } from '../data/content.js';
import Pic from '../components/Pic.jsx';

const B = '1.5px solid #181614';
const R = '1px solid rgba(24,22,20,.3)';
const SEC = { padding: '72px 64px', display: 'grid', gridTemplateColumns: '300px minmax(0,1fr)', gap: 64 };

function Block({ b, t }) {
  switch (b.t) {
    case 'cover':
      return (
        <div className="c-cover rv" data-morph="cover" style={{ margin: '64px 64px 0', aspectRatio: b.ar, maxHeight: b.maxh ? 900 : undefined, overflow: 'hidden', background: b.bg }}>
          <Pic className="ph" src={b.src} sizes="100vw" alt={t(b.alt)} />
        </div>
      );
    case 'text':
      return (
        <div className="c-sec" style={SEC}>
          <p className="label">{t(b.label)}</p>
          <p className="c-p rv" style={{ margin: 0, fontSize: 18, lineHeight: 1.6, maxWidth: 720 }} dangerouslySetInnerHTML={{ __html: t(b.html) }} />
        </div>
      );
    case 'list':
      return (
        <div className="c-sec" style={{ ...SEC, paddingBottom: 40 }}>
          <p className="label">{t(b.label)}</p>
          <div className="mono" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 720, borderBottom: R }}>
            {b.rows.map((r, i) => (
              <div key={i} className="c-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 20, padding: '16px 0', borderTop: R }}>
                <span>{t(r[0])}</span><span>{t(r[1])}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'bullets':
      return (
        <div className="c-sec" style={SEC}>
          <p className="label">{t(b.label)}</p>
          <div style={{ maxWidth: 720, borderBottom: R }}>
            {b.items.map((x, i) => <div key={i} className="c-li" style={{ padding: '16px 0', borderTop: R, fontSize: 16, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t(x) }} />)}
          </div>
        </div>
      );
    case 'images':
      return (
        <div className="c-img" style={{ margin: '0 64px 16px', display: b.imgs.length > 1 ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {b.imgs.map((im, i) => <Pic key={i} className="rv" src={im.src} sizes={b.imgs.length > 1 ? '(max-width: 900px) 100vw, 50vw' : '100vw'} alt={t(im.alt)} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />)}
        </div>
      );
    case 'note':
      return <p className="mono c-note" style={{ margin: '0 64px', fontSize: 10, opacity: 0.55 }} dangerouslySetInnerHTML={{ __html: t(b.html) }} />;
    case 'next': {
      const nx = obras.rows.find((r) => r.slug === b.slug);
      return (
        <div className="c-next" style={{ padding: '60px 64px 80px' }}>
          <Link className="next-link" to={`/obras/${b.slug}`} style={{ '--c': nx?.c }} onClick={(e) => startMorph(e, [
            { key: 'logo', el: e.currentTarget.querySelector('.next-logo'), src: nx?.logo?.color },
          ])}>
            <span className="mono next-label">{t(ui.next)}</span>
            <span className="next-mark">
              {nx?.logo
                ? <img className="next-logo" src={nx.logo.color} alt={nx.name} style={{ height: Math.round(nx.logo.h * 1.9) }} />
                : <span className="c-nextname">{nx ? nx.name : b.slug}</span>}
              <span className="next-arrow" aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      );
    }
    default:
      return null;
  }
}

export default function CasePage() {
  const { slug } = useParams();
  const t = useT();
  const c = caseBySlug[slug];
  // se veio do índice de obras, leva o logo (e a capa) até aqui
  useLayoutEffect(() => { finishMorph(); }, [slug]);
  useEffect(() => { if (c) document.title = `${obras.rows.find((r) => r.slug === slug)?.name}, Wictor Melo`; }, [c, slug]);
  if (!c) return <Navigate to="/" replace />;
  return (
    <div className="case" style={{ maxWidth: 1440, margin: '0 auto', background: '#EEE5D3', color: '#181614' }}>
      <div className="c-top mono case-top" style={{ padding: '40px 64px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Link className="lnk c-back" to="/" state={{ to: 'obras' }} style={{ fontSize: 11 }}>{t(ui.back)}</Link>
        <span className="c-right" style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 11 }}><LangSwitch /><span className="c-num">{t(c.num)}</span></span>
      </div>
      <div className="c-head" style={{ padding: '60px 64px 0', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 420px', gap: 64, alignItems: 'end' }}>
        <div>
          <p className="label">{t(c.label)}</p>
          {c.title.type === 'logo'
            ? <h1 style={{ margin: 0 }}><img className="c-logo" data-morph="logo" src={c.title.src} alt={c.title.alt} style={{ display: 'block', height: c.title.h, width: 'auto', marginTop: 26 }} /></h1>
            : <h1 className="c-h1" style={{ margin: '18px 0 0', fontSize: 168, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 0.85 }}>{c.title.text}</h1>}
          <p className="fell c-tag" style={{ margin: '20px 0 0', fontSize: 26 }}>{t(c.tag)}</p>
          {c.nameNote && <p className="name-note">{t(c.nameNote)}</p>}
        </div>
        <div className="mono" style={{ border: B, fontSize: 11, lineHeight: 1.6 }}>
          {c.ficha.map((r, i) => (
            <div key={i} style={{ padding: '12px 14px', borderBottom: i < c.ficha.length - 1 ? B : 0, display: r.k ? 'block' : 'flex', gap: 24 }}>
              {r.k && <><span style={{ opacity: 0.55 }}>{t(r.k)}</span><br /></>}
              <span dangerouslySetInnerHTML={{ __html: t(r.v) }} />
            </div>
          ))}
        </div>
      </div>
      {c.blocks.map((b, i) => <Block key={i} b={b} t={t} />)}
    </div>
  );
}
