// O GitHub Pages não conhece as rotas do React. Copiamos o index.html para
// cada rota (/obras/<slug>/) e para 404.html, assim qualquer link abre direto.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { cases } from '../src/data/cases.js';

const html = readFileSync('dist/index.html', 'utf8');
for (const c of cases) {
  mkdirSync(`dist/obras/${c.slug}`, { recursive: true });
  writeFileSync(`dist/obras/${c.slug}/index.html`, html);
}
writeFileSync('dist/404.html', html);
console.log(`postbuild: ${cases.length} páginas de case + 404.html`);
