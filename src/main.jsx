import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LangProvider } from './i18n.jsx';
import App from './App.jsx';
import { IntroProvider } from './components/Intro.jsx';
import './styles/global.css';
import './analytics.js';

createRoot(document.getElementById('root')).render(
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
