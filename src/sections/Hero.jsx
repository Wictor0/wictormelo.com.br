import { motion } from 'framer-motion';
import Logo from '../components/Logo.jsx';
import { useT, LangSwitch } from '../i18n.jsx';
import { ui } from '../data/content.js';
import { TopoCrop, Star } from '../components/Topo.jsx';
import { useIntroDone } from '../components/Intro.jsx';

const ease = [0.2, 0.8, 0.2, 1];

export default function Hero() {
  const t = useT();
  const go = useIntroDone();
  return (
    <section id="topo" className="dark" style={{ position: 'relative', height: '100svh', minHeight: 640, overflow: 'hidden', background: '#24211E', color: '#F4EFE6' }}>
      <motion.img
        className="ph"
        src="/assets/faf4e2a2aa76.jpg"
        alt={t(ui.heroAlt)}
        style={{ position: 'absolute', inset: 0 }}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={go ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.6, ease }}
      />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,16,14,.5) 0%, rgba(18,16,14,0) 20%, rgba(18,16,14,0) 50%, rgba(18,16,14,.75) 100%)' }} />
      <header className="wrap" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24 }}>
        <a className="lnk" href="#topo" style={{ fontSize: 17, fontWeight: 500 }}>Wictor Melo</a>
        <nav className="mono navl" aria-label="Seções" style={{ display: 'flex', gap: 30, fontSize: 11 }}>
          {ui.nav.map((n) => <a key={n.id} className="lnk" href={`#${n.id}`}>{t(n)}</a>)}
        </nav>
        <LangSwitch />
      </header>
      <div className="wrap" style={{ position: 'absolute', left: 0, right: 0, bottom: 'clamp(32px, 6vh, 64px)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
        <div style={{ maxWidth: 760 }}>
          <motion.p className="label" style={{ margin: '0 0 16px', opacity: 0.85, color: 'inherit' }} initial={{ opacity: 0, y: 16 }} animate={go ? { opacity: 0.85, y: 0 } : undefined} transition={{ delay: 0.5, duration: 0.8, ease }}>
            {t(ui.kicker)}
          </motion.p>
          <h1 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(60px, 8.6vw, 132px)', lineHeight: 0.9, letterSpacing: '-0.045em', overflow: 'hidden', padding: '0 .12em .1em 0', marginRight: '-.12em' }}>
            <motion.span style={{ display: 'inline-block' }} initial={{ y: '105%' }} animate={go ? { y: 0 } : undefined} transition={{ delay: 0.25, duration: 1.1, ease }}>Wictor Melo</motion.span>
          </h1>
          <motion.div className="mono" style={{ display: 'flex', gap: 32, marginTop: 22, fontSize: 12 }} initial={{ opacity: 0 }} animate={go ? { opacity: 1 } : undefined} transition={{ delay: 0.9, duration: 0.8 }}>
            <a className="lnk" href="#obras">{t(ui.seeWork)}</a>
            <a className="lnk" href="#contato">{t(ui.talk)}</a>
          </motion.div>
        </div>
        <motion.div className="ficha hero-ficha" style={{ width: 520, height: 236, color: '#F4EFE6' }} initial={{ opacity: 0, y: 24 }} animate={go ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.7, duration: 1, ease }}>
          <div style={{ overflow: 'hidden' }}><TopoCrop viewBox="921.8 81.4 150 110" label={t(ui.heroMapAlt)} /></div>
          <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr auto' }}>
            <div className="cell mono" style={{ fontSize: 13, lineHeight: 1.5 }}>8°00'32"S<br />34°51'18"W/</div>
            <div className="cell mono" style={{ fontSize: 11, lineHeight: 1.6 }}>Wictor Melo<br />{t(ui.portfolio26)}</div>
            <div className="mono" style={{ padding: '10px 14px', fontSize: 10, opacity: 0.85 }}>/Pernambuco</div>
            <div className="cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px' }}>
              <Star />
              <Logo height={17} label="WM" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
