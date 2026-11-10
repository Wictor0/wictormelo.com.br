"""
Gera os dados do relevo 3D de Pernambuco a partir do DEM Copernicus.

Saída (em react/public/relief/):
  pe-relief.bin   curvas de nivel em 3D, quantizadas em uint16
  pe-relief.json  metadados (niveis em metros, bbox, escala, formato)
  pe-height.png   heightmap 16-bit, opcional, para sombreado sutil

Parametros no topo. Rode de novo depois de mudar:

    python3 scripts/build_relief.py

O DEM (output_hh.tif, 96 MB, Copernicus COP90) nao fica no repositorio.
Baixe de novo em opentopography.org, recortando o bbox de Pernambuco
(-41.5, -9.6) a (-34.7, -7.1), e aponte DEM para ele.
Precisa de: rasterio, scipy, matplotlib, shapely, pillow, numpy.
"""
import json, struct, sys
import numpy as np
import rasterio
from rasterio.transform import rowcol
from scipy import ndimage as ndi
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from shapely.geometry import shape, LineString, MultiPolygon
from shapely.ops import unary_union
from PIL import Image

# ---------------- parametros ----------------
DEM        = 'dem/output_hh.tif'
GEOJSON    = 'scripts/br-estados.geojson'
UF         = 'PE'
DOWNSAMPLE = 4        # 8160x3000 -> 2040x750
SMOOTH     = 2.0      # suavizacao gaussiana, em pixels do grid reduzido
LEVEL_STEP = 50      # intervalo das curvas, em metros
LEVEL_MIN  = 25       # primeira curva acima do nivel do mar
SIMPLIFY   = 0.0018   # tolerancia em graus (~330 m)
MIN_PTS    = 6        # descarta fragmentos curtos
MIN_LEN    = 0.015    # comprimento minimo da linha, em graus (~2.2 km)
HEIGHTMAP  = (1024, 377)
OUT        = 'public/relief'
# --------------------------------------------


def log(*a):
    print(*a, flush=True)


def load_dem():
    r = rasterio.open(DEM)
    z = r.read(1)
    b = r.bounds
    log(f'DEM {r.width}x{r.height}  z {np.nanmin(z):.0f}..{np.nanmax(z):.0f} m')
    z = z[::DOWNSAMPLE, ::DOWNSAMPLE].astype(np.float32)
    z = np.nan_to_num(z, nan=0.0)
    z[z < 0] = 0.0
    z = ndi.gaussian_filter(z, SMOOTH)
    log(f'grid reduzido {z.shape[1]}x{z.shape[0]}')
    return z, b


def pe_polygon():
    d = json.load(open(GEOJSON))
    for f in d['features']:
        if f['properties'].get('sigla') == UF:
            g = shape(f['geometry'])
            if isinstance(g, MultiPolygon):
                g = max(g.geoms, key=lambda p: p.area)
            log(f'{UF}: {len(g.exterior.coords)} pontos no contorno')
            return g
    sys.exit(f'{UF} nao encontrado no geojson')


def contours(z, bounds, levels):
    """Curvas de nivel em coordenadas geograficas (lon, lat)."""
    h, w = z.shape
    lon = np.linspace(bounds.left, bounds.right, w)
    lat = np.linspace(bounds.top, bounds.bottom, h)
    cs = plt.contour(lon, lat, z, levels=levels)
    out = []
    for i, level in enumerate(cs.levels):
        segs = []
        for p in cs.allsegs[i]:
            if len(p) >= MIN_PTS:
                segs.append(p)
        out.append((float(level), segs))
    plt.close('all')
    return out


def main():
    z, bounds = load_dem()
    pe = pe_polygon()

    zmax = float(z.max())
    levels = list(range(LEVEL_MIN, int(zmax), LEVEL_STEP))
    log(f'{len(levels)} niveis: {levels[0]}..{levels[-1]} m')

    raw = contours(z, bounds, levels)

    # recorta pelo contorno do estado e simplifica
    lines = []          # (indice do nivel, array Nx2)
    for li, (level, segs) in enumerate(raw):
        kept = 0
        for seg in segs:
            ls = LineString(seg)
            clipped = ls.intersection(pe)
            if clipped.is_empty:
                continue
            parts = getattr(clipped, 'geoms', [clipped])
            for part in parts:
                if part.geom_type != 'LineString' or part.length < MIN_LEN:
                    continue
                s = part.simplify(SIMPLIFY, preserve_topology=False)
                pts = np.asarray(s.coords, dtype=np.float64)
                if len(pts) >= MIN_PTS:
                    lines.append((li, pts))
                    kept += 1
        log(f'  {int(level):5d} m  {kept:3d} linhas')

    # contorno do estado, como linha propria (nivel -1)
    border = np.asarray(
        pe.exterior.simplify(SIMPLIFY * 0.6, preserve_topology=False).coords,
        dtype=np.float64)

    # ---- quantizacao ----
    x0, y0 = bounds.left, bounds.bottom
    dx, dy = bounds.right - x0, bounds.top - y0
    Q = 65535.0

    def quant(pts):
        qx = np.clip((pts[:, 0] - x0) / dx, 0, 1) * Q
        qy = np.clip((pts[:, 1] - y0) / dy, 0, 1) * Q
        return np.stack([qx, qy], 1).round().astype('<u2')

    buf = bytearray()
    buf += struct.pack('<I', len(lines) + 1)
    # contorno primeiro, nivel 65535 = borda
    qb = quant(border)
    buf += struct.pack('<HH', 65535, len(qb)) + qb.tobytes()
    npts = len(qb)
    for li, pts in lines:
        q = quant(pts)
        buf += struct.pack('<HH', li, len(q)) + q.tobytes()
        npts += len(q)

    import os
    os.makedirs(OUT, exist_ok=True)
    open(f'{OUT}/pe-relief.bin', 'wb').write(buf)

    meta = {
        'format': 'uint16 LE; header u32 nLines; por linha: u16 level, u16 nPts, nPts*(u16 x, u16 y)',
        'levels': [float(l) for l in levels],
        'borderLevel': 65535,
        'bbox': [bounds.left, bounds.bottom, bounds.right, bounds.top],
        'quant': 65535,
        'aspect': round(dx / dy, 4),
        'zMax': round(zmax, 1),
        'note': 'x,y em 0..1 dentro do bbox. z = levels[level] em metros; borda ao nivel do mar.',
    }
    json.dump(meta, open(f'{OUT}/pe-relief.json', 'w'), indent=1)

    # ---- heightmap opcional ----
    hm = ndi.zoom(z, (HEIGHTMAP[1] / z.shape[0], HEIGHTMAP[0] / z.shape[1]), order=1)
    hm = np.clip(hm / zmax, 0, 1)
    Image.fromarray((hm * 255).astype('u1')).save(f'{OUT}/pe-height.png', optimize=True)

    kb = len(buf) / 1024
    log(f'\npe-relief.bin  {kb:.0f} KB   {len(lines)+1} linhas  {npts} pontos')
    log(f'pe-height.png  {os.path.getsize(f"{OUT}/pe-height.png")/1024:.0f} KB')


if __name__ == '__main__':
    main()
