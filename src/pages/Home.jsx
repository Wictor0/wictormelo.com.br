import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../scrollTo.js';
import Hero from '../sections/Hero.jsx';
import Sobre from '../sections/Sobre.jsx';
import Obras from '../sections/Obras.jsx';
import Oficio from '../sections/Oficio.jsx';
import Trajeto from '../sections/Trajeto.jsx';
import Galeria from '../sections/Galeria.jsx';
import Contato from '../sections/Contato.jsx';

export default function Home() {
  const { hash, state } = useLocation();
  useEffect(() => {
    document.title = 'Wictor Melo';
    // Vindo de um case (state.to) ou de um link antigo com #: rola até a seção e limpa a URL
    const id = state?.to || (hash ? hash.slice(1) : null);
    if (id) {
      setTimeout(() => scrollToSection(id, 'instant'), 0);
      window.history.replaceState(null, '', '/');
    }
  }, [hash, state]);
  return (
    <div style={{ background: '#EEE5D3', color: '#181614' }}>
      <Hero /><Sobre /><Obras /><Oficio /><Trajeto /><Galeria /><Contato />
    </div>
  );
}
