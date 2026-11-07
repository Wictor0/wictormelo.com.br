import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import CasePage from './pages/CasePage.jsx';
import { TopoDefs } from './components/Topo.jsx';

// Transição entre páginas: uma cortina azul com o mapa sobe (sem esticar) cobrindo
// a página que sai e continua subindo para revelar a nova.
const ease = [0.65, 0, 0.35, 1];
let firstPage = true;

function Curtain(props) {
  return (
    <motion.div className="curtain" aria-hidden="true" {...props}>
      <svg viewBox="560 40 420 260" preserveAspectRatio="xMidYMid slice"><use href="#pe-topo" /></svg>
    </motion.div>
  );
}

function Page({ children }) {
  const [enter] = useState(() => !firstPage);
  useEffect(() => { firstPage = false; }, []);
  return (
    <motion.main
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1, transition: { duration: 0.6 } }}
    >
      {children}
      {enter && (
        <Curtain
          initial={{ y: '0%' }}
          animate={{ y: '-100%', transition: { duration: 0.8, ease, delay: 0.05 } }}
        />
      )}
      <Curtain
        initial={{ y: '100%' }}
        animate={{ y: '100%' }}
        exit={{ y: '0%', transition: { duration: 0.6, ease } }}
      />
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
      const el = id ? document.getElementById(id) : null;
      e.preventDefault();
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <AnimatePresence mode="wait" onExitComplete={() => { if (!location.state?.to) window.scrollTo(0, 0); }}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/obras/:slug" element={<Page><CasePage /></Page>} />
          <Route path="*" element={<Page><Home /></Page>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
