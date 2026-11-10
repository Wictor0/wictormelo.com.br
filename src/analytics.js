// Métricas de acesso com Umami Cloud (sem cookies, sem banner de consentimento).
// Painel: https://cloud.umami.is
//
// Para ativar, cole o ID do site (Website ID) abaixo. Vazio, nada é carregado.
// A troca de páginas do React é contada sozinha pelo script do Umami.
// Só conta em wictormelo.com.br, então o localhost não suja os números.
// Para não contar as suas próprias visitas, rode uma vez no console de cada
// navegador seu, já no site:  localStorage.setItem('umami.disabled', 1)
const UMAMI_ID = 'c3167374-5195-4de3-b38f-84e07dda583e';
const DOMAIN = 'wictormelo.com.br';

if (UMAMI_ID && typeof window !== 'undefined' && location.hostname.endsWith(DOMAIN)) {
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cloud.umami.is/script.js';
  s.dataset.websiteId = UMAMI_ID;
  s.dataset.domains = DOMAIN;
  document.head.appendChild(s);

  const track = (name, data) => { try { window.umami?.track(name, data); } catch {} };
  const lang = () => document.documentElement.lang?.startsWith('en') ? 'en' : 'pt';

  // Um ouvinte só para os cliques que importam, em vez de marcar link por link
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('.lang-btn');
    if (btn) { track('Idioma', { para: btn.textContent.trim().toLowerCase() }); return; }

    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    const page = location.pathname;

    if (href.startsWith('mailto:')) return track('E-mail', { pagina: page });
    if (href.includes('/cv/')) return track('Baixou CV', { idioma: href.includes('-en') ? 'en' : 'pt', pagina: page });
    if (/^https?:\/\//.test(href) && !href.includes(DOMAIN)) {
      return track('Link externo', { destino: new URL(href).hostname.replace(/^www\./, ''), pagina: page, idioma: lang() });
    }
  }, true);
}
