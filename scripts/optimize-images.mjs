// Gera AVIF e WebP em mais de um tamanho para cada JPG de public/assets e public/g,
// e escreve src/data/img-manifest.json, que o componente <Pic> lê.
// Os JPGs originais ficam onde estão, como reserva. Os resultados são commitados:
// só rode de novo quando adicionar ou trocar uma imagem.
//
//   npm i --no-save sharp && node scripts/optimize-images.mjs
//
import sharp from 'sharp';
import { readdirSync, writeFileSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const DIRS = ['public/assets', 'public/g'];
const AVIF = { quality: 52, effort: 6 };
const WEBP = { quality: 78, effort: 6 };

const manifest = {};
let before = 0, after = { avif: 0, webp: 0 };

const widthsFor = (w) => {
  const ws = new Set([w]);
  if (w >= 700) ws.add(480);
  if (w >= 1300) ws.add(960);
  return [...ws].sort((a, b) => a - b);
};

for (const dir of DIRS) {
  for (const f of readdirSync(dir)) {
    const ext = extname(f).toLowerCase();
    if (ext !== '.jpg') continue; // SVG e a máscara PNG não entram
    const stem = basename(f, ext);
    const file = join(dir, f);
    const meta = await sharp(file).metadata();
    const ws = widthsFor(meta.width);
    const url = '/' + dir.replace(/^public\//, '') + '/' + f;
    manifest[url] = { w: meta.width, h: meta.height, ws };
    before += statSync(file).size;

    for (const w of ws) {
      const suffix = w === meta.width ? '' : `-${w}`;
      const pipe = () => {
        const p = sharp(file);
        return w === meta.width ? p : p.resize({ width: w });
      };
      const a = join(dir, `${stem}${suffix}.avif`);
      const b = join(dir, `${stem}${suffix}.webp`);
      await pipe().avif(AVIF).toFile(a);
      await pipe().webp(WEBP).toFile(b);
      if (w === meta.width) { after.avif += statSync(a).size; after.webp += statSync(b).size; }
    }
  }
}

writeFileSync('src/data/img-manifest.json', JSON.stringify(manifest, null, 1));
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`${Object.keys(manifest).length} imagens. JPG ${kb(before)} → WebP ${kb(after.webp)}, AVIF ${kb(after.avif)} (tamanho cheio)`);
