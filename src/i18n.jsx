import { createContext, useContext, useEffect, useState } from 'react';

const LangContext = createContext({ lang: 'pt', setLang: () => {} });

function initialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {}
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

// t(x): aceita string simples ou { pt, en }
export function useT() {
  const { lang } = useContext(LangContext);
  return (x) => (x == null ? '' : typeof x === 'string' || Array.isArray(x) ? x : x[lang] ?? x.pt);
}

export function useLang() {
  return useContext(LangContext);
}

export function LangSwitch({ style }) {
  const { lang, setLang } = useLang();
  const opt = (l) => (
    <button
      type="button"
      className="lang-btn"
      aria-pressed={lang === l}
      onClick={() => setLang(l)}
      style={{ opacity: lang === l ? 1 : 0.5 }}
    >
      {l.toUpperCase()}
    </button>
  );
  return (
    <span className="mono" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}>
      {opt('pt')} / {opt('en')}
    </span>
  );
}
