import { createContext, useContext, useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { loadTopo } from './Topo.jsx';

// Abertura do site: o contorno de Pernambuco aparece vazio e as curvas de nível
// vão se formando. Roda só na primeira entrada de cada visita (sessionStorage).

const IntroContext = createContext(true);
export const useIntroDone = () => useContext(IntroContext);

const ease = [0.65, 0, 0.35, 1];
const LINES_START = 0.6;   // s, quando começam as curvas
const LINES_SPREAD = 2.2;  // s, do litoral ao sertão
const LINE_DUR = 1.2;      // s, cada curva
const DRAW_END = (LINES_START + LINES_SPREAD + LINE_DUR) * 1000;

function shouldSkip() {
  try {
    if (sessionStorage.getItem('intro-seen')) return true;
  } catch {}
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function parseTopo(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const paths = [...doc.querySelectorAll('path')].map((p) => p.getAttribute('d'));
  // [0] recorte do estado, [1] curvas de nível, [2] contorno
  if (paths.length < 3) return null;
  // Cada curva vira um traço separado; elas vão sendo desenhadas do litoral para o sertão
  const subs = paths[1].match(/M[^M]+/g) || [];
  const xs = subs.map((d) => parseFloat(d.slice(1)));
  const max = Math.max(...xs), min = Math.min(...xs);
  const lines = subs.map((d, i) => ({ d, delay: LINES_START + ((max - xs[i]) / (max - min || 1)) * LINES_SPREAD }));
  return { clip: paths[0], lines, border: paths[2] };
}

export function IntroProvider({ children }) {
  const [skip] = useState(shouldSkip);
  const [paths, setPaths] = useState(null);
  const [show, setShow] = useState(!skip);
  const [loaded, setLoaded] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (skip) return;
    document.documentElement.style.overflow = 'hidden';
    const hero = new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = '/assets/faf4e2a2aa76.jpg'; });
    loadTopo().then((t) => { setPaths(parseTopo(t)); setTimeout(() => setDrawn(true), DRAW_END - 700); });
    const timeout = new Promise((res) => setTimeout(res, 8000));
    Promise.race([Promise.all([hero, loadTopo()]), timeout]).then(() => setLoaded(true));
    // segurança: se o mapa não desenhar por algum motivo, abre o site mesmo assim
    const safety = setTimeout(() => setDrawn(true), 9000);
    return () => clearTimeout(safety);
  }, [skip]);

  // O site abre assim que as curvas terminam de ser desenhadas (e a foto do topo carregou)
  useEffect(() => { if (loaded && drawn) setShow(false); }, [loaded, drawn]);

  const finish = () => {
    document.documentElement.style.overflow = '';
    try { sessionStorage.setItem('intro-seen', '1'); } catch {}
  };

  return (
    <IntroContext.Provider value={!show}>
      {children}
      <AnimatePresence onExitComplete={finish}>
        {show && (
          <motion.div
            key="intro"
            className="intro"
            initial={{ y: 0 }}
            exit={{ y: '-100%', transition: { duration: 0.9, ease } }}
            aria-hidden="true"
          >
            <div className="intro-inner">
              <svg viewBox="5 10 1015 363" className="intro-map">
                {paths && (
                  <>
                    <defs><clipPath id="intro-clip"><path d={paths.clip} /></clipPath></defs>
                    <motion.path
                      d={paths.border} fill="none" stroke="#EEE5D3" strokeWidth="1.9" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease }}
                    />
                    <g clipPath="url(#intro-clip)" opacity="0.75">
                      {paths.lines.map((l, i) => (
                        <path key={i} d={l.d} pathLength="1" className="intro-line" fill="none" stroke="#EEE5D3" strokeWidth="1.1" strokeLinejoin="round" style={{ animationDelay: `${l.delay}s`, animationDuration: `${LINE_DUR}s` }} />
                      ))}
                    </g>
                  </>
                )}
              </svg>
              <motion.div className="intro-meta mono" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
                <span>Pernambuco</span>
                <span>8°19'00"S 37°53'00"W/</span>
                <Logo height={16} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
