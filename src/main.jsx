import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LangProvider } from './i18n.jsx';
import App from './App.jsx';
import { IntroProvider } from './components/Intro.jsx';
import './styles/global.css';
import './analytics.js';

// Página de teste do relevo 3D: fica fora do site (sem abertura, sem rotas)
// e só baixa o próprio código quando alguém abre /teste-relevo.
const TesteRelevo = lazy(() => import('./relief/TesteRelevo.jsx'));
const teste = window.location.pathname.replace(/\/+$/, '') === '/teste-relevo';

createRoot(document.getElementById('root')).render(
  teste ? <Suspense fallback={null}><TesteRelevo /></Suspense> :
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <IntroProvider>
          <App />
        </IntroProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>
);
