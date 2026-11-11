import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import CasePage from './pages/CasePage.jsx';
import Pernambuco from './pages/Pernambuco.jsx';
import { TopoDefs } from './components/Topo.jsx';
import { morphPending } from './morph.js';
import { scrollToSection } from './scrollTo.js';

// Transição entre páginas: uma cortina azul com o mapa sobe (sem esticar) cobrindo
// a página que sai e continua subindo para revelar a nova.
const ease = [0.65, 0, 0.35, 1];
let firstPage = true;

// O mapa da cortina é uma imagem pronta (feita do mesmo #pe-topo). Desenhar o SVG
// do mapa a cada quadro pesava demais no celular durante a transição.
const CURTAIN_IMG = '/curtain-map.webp';
if (typeof window !== 'undefined') { const i = new Image(); i.decoding = 'async'; i.src = CURTAIN_IMG; }

function Curtain(props) {
  return (
    <motion.div className="curtain" aria-hidden="true" {...props}>
      <img src={CURTAIN_IMG} alt="" decoding="async" />
    </motion.div>
  );
}

// Duas formas de trocar de página. Ao abrir uma obra pelo índice, o logo voa até o
// título do case (morph.js) e as páginas só esmaecem. No resto (voltar, links
// diretos, quem prefere menos movimento), a cortina com o mapa.
// `custom` vem do AnimatePresence e diz, na hora da saída, qual das duas é.
const mainV = {
  in: (m) => ({ opacity: 1, transition: m ? { duration: 0.45, delay: 0.25 } : { duration: 0 } }),
  out: (m) => (m ? { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } } : { opacity: 1, transition: { duration: 0.6 } }),
};
const curtainV = {
  rest: { y: '100%' },
  out: (m) => (m ? { y: '100%', transition: { duration: 0 } } : { y: '0%', transition: { duration: 0.6, ease } }),
};

function Page({ children }) {
  const [enter] = useState(() => (firstPage ? null : morphPending() ? 'morph' : 'curtain'));
  useEffect(() => { firstPage = false; }, []);
  return (
    <motion.main
      custom={enter === 'morph'}
      variants={mainV}
      initial={enter === 'morph' ? { opacity: 0 } : { opacity: 1 }}
      animate="in"
      exit="out"
    >
      {children}
      {enter === 'curtain' && (
        <Curtain
          initial={{ y: '0%' }}
          animate={{ y: '-100%', transition: { duration: 0.8, ease, delay: 0.05 } }}
        />
      )}
      <Curtain variants={curtainV} initial="rest" animate="rest" exit="out" />
    </motion.main>
  );
}

function ScrollTop() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

// Links internos (#sobre, #contato...) rolam suave sem deixar o # na URL
function useCleanAnchors() {
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      e.preventDefault();
      if (!scrollToSection(id)) window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export default function App() {
  const location = useLocation();
  useCleanAnchors();
  return (
    <>
      <TopoDefs />
      <AnimatePresence mode="wait" custom={morphPending()} onExitComplete={() => { if (!location.state?.to) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/obras/:slug" element={<Page><CasePage /></Page>} />
          <Route path="/pernambuco" element={<Page><Pernambuco /></Page>} />
          <Route path="*" element={<Page><Home /></Page>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
