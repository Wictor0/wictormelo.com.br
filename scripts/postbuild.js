// O GitHub Pages não conhece as rotas do React. Copiamos o index.html para
// cada rota (/obras/<slug>/) e para 404.html, assim qualquer link abre direto.
// Em cada cópia trocamos título, descrição, canonical e imagem de compartilhamento
// pelos dados daquele case, para o Google e o WhatsApp mostrarem o certo.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { cases } from '../src/data/cases.js';
import { obras } from '../src/data/content.js';

const SITE = 'https://wictormelo.com.br';
const html = readFileSync('dist/index.html', 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Cabe em ~155 caracteres e termina numa palavra inteira
function clip(s, max = 155) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;.\s]+$/, '') + '…';
}

function describe(c) {
  const tag = c.tag.pt.trim();
  const first = c.blocks.find((b) => b.t === 'text');
  const body = first ? plain(first.html.pt) : '';
  if (!body) return clip(tag);
  // tagline + primeira frase do resumo, se couber; senão, o começo do resumo cortado numa palavra
  const sentence = body.match(/^.*?[.!?](?=\s|$)/)?.[0] || body;
  const both = `${tag} ${sentence}`;
  if (both.length <= 160) return both;
  return sentence.length <= 160 ? sentence : clip(both);
}

// troca o atributo content (ou href) da tag que casa com `match`
function setTag(src, match, attr, value) {
  const re = new RegExp(`(<(?:meta|link)[^>]*${match}[^>]*${attr}=")[^"]*(")`);
  if (!re.test(src)) throw new Error(`postbuild: tag não encontrada (${match})`);
  return src.replace(re, `$1${esc(value)}$2`);
}

function forCase(c) {
  const row = obras.rows.find((r) => r.slug === c.slug);
  const name = row?.name || c.title.alt || c.slug;
  const title = `${name}, Wictor Melo`;
  const desc = describe(c);
  const url = `${SITE}/obras/${c.slug}/`;
  const cover = c.blocks.find((b) => b.t === 'cover');
  const image = cover ? SITE + cover.src : `${SITE}/og.jpg`;

  return withMeta({ title, desc, url, image });
}

function withMeta({ title, desc, url, image }) {
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  out = setTag(out, 'name="description"', 'content', desc);
  out = setTag(out, 'rel="canonical"', 'href', url);
  out = setTag(out, 'property="og:title"', 'content', title);
  out = setTag(out, 'property="og:description"', 'content', desc);
  out = setTag(out, 'property="og:url"', 'content', url);
  out = setTag(out, 'property="og:image"', 'content', image);
  return out;
}

for (const c of cases) {
  mkdirSync(`dist/obras/${c.slug}`, { recursive: true });
  writeFileSync(`dist/obras/${c.slug}/index.html`, forCase(c));
}
// o relevo 3D, com endereço próprio
mkdirSync('dist/pernambuco', { recursive: true });
writeFileSync('dist/pernambuco/index.html', withMeta({
  title: 'Pernambuco em 3D, Wictor Melo',
  desc: 'O relevo de Pernambuco do litoral ao sertão, em curvas de nível. Gire, incline e aproxime.',
  url: `${SITE}/pernambuco/`,
  image: `${SITE}/og-pernambuco.jpg`,
}));
writeFileSync('dist/404.html', html);
console.log(`postbuild: ${cases.length} páginas de case, /pernambuco e 404.html`);
