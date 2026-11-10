// Transição com continuidade entre o índice de obras e a página do case.
//
// No clique, copiamos o logo (e, no celular, a capa do card) para elementos
// flutuantes por cima de tudo, na mesma posição. A rota troca por baixo. Quando a
// página do case monta, medimos onde o logo e a capa ficam e levamos os flutuantes
// até lá. No fim, o elemento real aparece e o flutuante some.
//
// Não dá para usar layoutId do Framer Motion: com AnimatePresence mode="wait" a
// página antiga desmonta antes da nova montar, e o layoutId não atravessa a troca.

const EASE = 'cubic-bezier(.65,0,.35,1)';
const DUR = 720;
const SAFETY = 3500; // se o destino nunca aparecer, os flutuantes somem sozinhos

let pending = null; // { items: [{ key, node, img }], timer }

export const morphPending = () => !!pending;

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Chame no onClick do link, antes da navegação.
 * @param {MouseEvent} e
 * @param {Array<{key:string, el:Element|null, src:string, fit?:'contain'|'cover'}>} parts
 * @returns {boolean} true se a transição começou
 */
export function startMorph(e, parts) {
  if (e && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
  if (reduced()) return false;
  cleanup();

  const items = [];
  for (const p of parts) {
    if (!p.el || !p.src) continue;
    const r = p.el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) continue;

    const node = document.createElement('div');
    node.className = 'morph';
    Object.assign(node.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = '';
    img.style.objectFit = p.fit || 'contain';
    img.style.objectPosition = p.fit === 'cover' ? '50% 50%' : 'left center';
    node.appendChild(img);
    document.body.appendChild(node);
    items.push({ key: p.key, node, img, fit: p.fit || 'contain' });
  }
  if (!items.length) return false;

  // a página atual esmaece por baixo dos flutuantes (fill: forwards segura o 0
  // até ela sair do DOM, sem piscar no último quadro)
  document.querySelector('main')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
  pending = { items, timer: setTimeout(cleanup, SAFETY) };
  return true;
}

// Medida do destino. O logo do case tem largura automática: se a imagem ainda não
// carregou, a largura sai da proporção do próprio flutuante.
function targetRect(el, item) {
  const r = el.getBoundingClientRect();
  if (item.fit === 'contain' && r.height && (!r.width || r.width < 2)) {
    const ar = item.img.naturalWidth && item.img.naturalHeight
      ? item.img.naturalWidth / item.img.naturalHeight
      : parseFloat(item.node.style.width) / parseFloat(item.node.style.height);
    return { left: r.left, top: r.top, width: r.height * ar, height: r.height };
  }
  return r;
}

/** Chame quando a página do case montar (useLayoutEffect). */
export function finishMorph() {
  if (!pending) return;
  const { items, timer } = pending;
  pending = null;
  clearTimeout(timer);

  for (const item of items) {
    const target = document.querySelector(`[data-morph="${item.key}"]`);
    if (!target) { fadeOut(item.node); continue; }
    target.classList.add('morph-hide');

    const to = targetRect(target, item);
    const from = item.node.getBoundingClientRect();
    const anim = item.node.animate(
      [
        { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` },
      ],
      { duration: DUR, easing: EASE, fill: 'forwards' }
    );
    anim.onfinish = () => {
      target.classList.remove('morph-hide');
      fadeOut(item.node);
    };
  }
}

function fadeOut(node) {
  const a = node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
  a.onfinish = () => node.remove();
}

function cleanup() {
  if (!pending) return;
  clearTimeout(pending.timer);
  pending.items.forEach((i) => i.node.remove());
  pending = null;
}
