// Carrega o relevo 3D de Pernambuco (curvas de nível empilhadas pela altitude).
//
// Os dados vêm de public/relief/, gerados a partir do DEM Copernicus pelo
// script build_relief.py. Formato do .bin, little endian:
//   uint32  número de linhas
//   por linha: uint16 nível, uint16 nº de pontos, depois nPts * (uint16 x, uint16 y)
// x e y vêm normalizados em 0..65535 dentro do bbox; z vem da tabela de níveis,
// em metros. O nível 65535 é o contorno do estado, ao nível do mar.

const BORDER = 65535;

/**
 * Converte o binário em geometrias prontas para o Three.js.
 *
 * @param {ArrayBuffer} buf   conteúdo de pe-relief.bin
 * @param {object} meta       conteúdo de pe-relief.json
 * @param {object} [opts]
 * @param {number} [opts.width=2]   largura do mapa em unidades de cena
 * @param {number} [opts.height=0.35] altura do pico mais alto, nas mesmas unidades
 * @param {boolean} [opts.center=true] centraliza em torno da origem
 * @returns {{lines: Array, meta: object, size: {x:number,y:number,z:number}}}
 *   cada linha: { level, z, altitude, isBorder, positions: Float32Array }
 *   positions são triplas x,y,z no plano XZ com Y para cima (padrão do Three.js)
 */
export function parseRelief(buf, meta, opts = {}) {
  const { width = 2, height = 0.35, center = true } = opts;
  const dv = new DataView(buf);
  const levels = meta.levels;
  const q = meta.quant;
  const aspect = meta.aspect;

  // o mapa ocupa `width` no eixo X e width/aspect no eixo Z
  const sx = width;
  const sz = width / aspect;
  const sy = height / meta.zMax;
  const ox = center ? -sx / 2 : 0;
  const oz = center ? -sz / 2 : 0;

  const n = dv.getUint32(0, true);
  const lines = [];
  let off = 4;

  for (let i = 0; i < n; i++) {
    const level = dv.getUint16(off, true);
    const count = dv.getUint16(off + 2, true);
    off += 4;

    const isBorder = level === BORDER;
    const altitude = isBorder ? 0 : levels[level];
    const y = altitude * sy;

    const positions = new Float32Array(count * 3);
    for (let p = 0; p < count; p++) {
      const x = dv.getUint16(off, true) / q;
      // y do dado cresce para o norte; no Three.js o eixo Z cresce para o sul
      const v = dv.getUint16(off + 2, true) / q;
      off += 4;
      positions[p * 3] = ox + x * sx;
      positions[p * 3 + 1] = y;
      positions[p * 3 + 2] = oz + (1 - v) * sz;
    }

    lines.push({ level, altitude, y, isBorder, positions });
  }

  return { lines, meta, size: { x: sx, y: height, z: sz } };
}

/** Baixa e converte. Chame uma vez e guarde o resultado. */
export async function loadRelief(opts = {}) {
  const base = opts.base ?? '/relief';
  const [metaRes, binRes] = await Promise.all([
    fetch(`${base}/pe-relief.json`),
    fetch(`${base}/pe-relief.bin`),
  ]);
  if (!metaRes.ok || !binRes.ok) throw new Error('relevo não encontrado');
  const meta = await metaRes.json();
  const buf = await binRes.arrayBuffer();
  return parseRelief(buf, meta, opts);
}

/**
 * Versão mais leve: mantém o contorno e uma curva a cada `nth` níveis.
 * As altitudes são 25, 75, 125 … então nth=2 dá uma curva a cada 100 m.
 */
export function thinLevels(relief, nth = 2, offset = 0) {
  return relief.lines.filter(
    (l) => l.isBorder || (l.level - offset) % nth === 0
  );
}
