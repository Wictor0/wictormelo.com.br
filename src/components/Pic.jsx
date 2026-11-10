// Imagem com AVIF e WebP, em mais de um tamanho, e o JPG original como reserva.
// As variantes e o img-manifest.json saem de scripts/optimize-images.mjs.
// Se a imagem não estiver no manifesto, vira um <img> comum.
import manifest from '../data/img-manifest.json';

const variant = (src, w, full, ext) => {
  const base = src.replace(/\.jpg$/i, '');
  return `${base}${w === full ? '' : `-${w}`}.${ext}`;
};

const srcSet = (src, m, ext) =>
  m.ws.map((w) => `${variant(src, w, m.w, ext)} ${w}w`).join(', ');

/**
 * @param {string}  src      caminho do JPG original, ex. '/assets/abc.jpg'
 * @param {string}  sizes    largura em que a imagem aparece, como no atributo sizes
 * @param {*}       as       componente do <img> (padrão 'img'; use motion.img para animar)
 */
export default function Pic({ src, sizes = '100vw', as: Img = 'img', alt = '', ...rest }) {
  const m = manifest[src];
  if (!m) return <Img src={src} alt={alt} {...rest} />;
  return (
    // display: contents deixa o <picture> invisível para o layout
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={srcSet(src, m, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(src, m, 'webp')} sizes={sizes} />
      <Img src={src} alt={alt} width={m.w} height={m.h} {...rest} />
    </picture>
  );
}

/** Baixa a imagem no formato que o navegador escolheria, para a abertura esperar por ela. */
export function preloadPic(src, sizes = '100vw') {
  return new Promise((resolve) => {
    const m = manifest[src];
    const done = () => resolve();
    if (!m) { const i = new Image(); i.onload = i.onerror = done; i.src = src; return; }
    const pic = document.createElement('picture');
    for (const [type, ext] of [['image/avif', 'avif'], ['image/webp', 'webp']]) {
      const s = document.createElement('source');
      s.type = type; s.srcset = srcSet(src, m, ext); s.sizes = sizes;
      pic.appendChild(s);
    }
    const img = document.createElement('img');
    img.onload = img.onerror = done;
    pic.appendChild(img);
    img.src = src;
  });
}
