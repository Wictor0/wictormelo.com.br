import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect } from 'react';
import Home from './pages/Home.jsx';
import CasePage from './pages/CasePage.jsx';
import { TopoDefs } from './components/Topo.jsx';

// Transição entre páginas: a página nova sobe e aparece
function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {children}
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
