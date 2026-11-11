// Rolar até uma seção deixando o começo dela num ponto bom da tela.
//
// As seções têm um respiro grande no topo (até 140px) e, em Obras, Ofício e
// Trajeto, a faixa do mapa antes do título. Rolando até o topo da <section>, o
// menu deixava até um terço da tela vazio antes do conteúdo. Aqui o alvo é a
// faixa do mapa ou o rótulo da seção, o que vier primeiro, com uma margem curta.
// Um elemento com data-center (o mapa do Contato) fica no meio da tela.
export function scrollToSection(id, behavior = 'smooth') {
  if (!id || id === 'topo') { window.scrollTo({ top: 0, behavior }); return true; }
  const el = document.getElementById(id);
  if (!el) return false;
  let top;
  if (el.hasAttribute('data-center')) {
    const r = el.getBoundingClientRect();
    top = r.top + window.scrollY - (window.innerHeight - r.height) / 2;
  } else {
    // a faixa tem animação de entrada (sobe ao aparecer): mede o contêiner dela, que não se move
    const strip = el.querySelector('.strip');
    const mark = strip?.parentElement || el.querySelector('.label') || el;
    top = mark.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 24 : 48);
  }
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}
