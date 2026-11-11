import { useCallback, useEffect, useRef, useState } from 'react';
import Relevo from './Relevo.jsx';

// Página de teste do relevo 3D, fora do site: /teste-relevo
// Serve para achar os valores olhando. Parâmetros de URL:
//   ?modo=3d | 2d   força um dos dois (o padrão decide sozinho, como no site)

const INICIAL = {
  height: 0.13, thin: 1, speed: 3, angle: 40,
  zoom: 1, borderWidth: 1.5, lineWidth: 0.75, depth: 0.45, tilt: 1,
};

const CURVAS = {
  1: 'todas · 50 m',
  2: 'metade · 100 m',
  3: 'um terço · 150 m',
};

function Ctl({ rotulo, valor, mostra, dica, ...input }) {
  return (
    <label className="ctl">
      <span className="ctl-top"><span>{rotulo}</span><output>{mostra}</output></span>
      <input type="range" value={valor} {...input} />
      {dica && <span className="ctl-dica">{dica}</span>}
    </label>
  );
}

export default function TesteRelevo() {
  const q = new URLSearchParams(window.location.search);
  const [modo, setModo] = useState(q.get('modo') === '3d' || q.get('modo') === '2d' ? q.get('modo') : 'auto');
  const [valeu, setValeu] = useState(null);
  const [p, setP] = useState(INICIAL);
  const [auto, setAuto] = useState(true);
  const [st, setSt] = useState(null);
  const [fechado, setFechado] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const api = useRef(null);
  const [carga, setCarga] = useState(null);
  const mede = () => { const r = api.current?.bench(120); if (r) setCarga(r); };

  useEffect(() => {
    document.title = 'Teste do relevo 3D';
    let m = document.querySelector('meta[name=robots]');
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
    m.content = 'noindex';
  }, []);

  const muda = (k) => (e) => {
    const v = Number(e.target.value);
    if (k === 'thin') setAuto(false); // mexeu à mão: o ajuste automático sai de cena
    setP((a) => ({ ...a, [k]: v }));
  };
  const onStats = useCallback((s) => setSt(s), []);
  const onParams = useCallback((n) => setP((a) => ({ ...a, ...n })), []);
  const onQuality = useCallback((thin) => setP((a) => ({ ...a, thin })), []);

  const texto = `height: ${p.height}, thin: ${p.thin}, speed: ${p.speed}, angle: ${Math.round(p.angle)},\nzoom: ${p.zoom}, borderWidth: ${p.borderWidth}, lineWidth: ${p.lineWidth},\ndepth: ${p.depth}, tilt: ${p.tilt}`;
  const copia = () => {
    navigator.clipboard?.writeText(`{ ${texto.replace(/\n/g, ' ')} }`).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 1500);
    }).catch(() => {});
  };

  return (
    <div className="teste">
      <div className="teste-cena">
        <Relevo params={p} mode={modo} auto={auto} onStats={onStats} onQuality={onQuality} onParams={onParams} onMode={setValeu} apiRef={api} />
        <div className="teste-selo">
          Pernambuco · relevo<br />
          {valeu === '2d' ? <b>reserva 2D</b> : <>DEM Copernicus 90 m</>}
        </div>
      </div>

      <aside className={`painel${fechado ? ' fechado' : ''}`}>
        <div className="painel-topo">
          <h1>Relevo, teste</h1>
          <button type="button" className="painel-abre" onClick={() => setFechado((f) => !f)} aria-expanded={!fechado}>
            {fechado ? 'Ajustar' : 'Fechar'}
          </button>
        </div>

        <Ctl rotulo="Exagero vertical" valor={p.height} mostra={p.height.toFixed(2)} min="0.05" max="0.9" step="0.01" onChange={muda('height')}
          dica="Altura do pico mais alto. A largura do mapa vale 2." />
        <Ctl rotulo="Curvas" valor={4 - p.thin} mostra={CURVAS[p.thin]} min="1" max="3" step="1" onChange={(e) => muda('thin')({ target: { value: 4 - Number(e.target.value) } })}
          dica={auto ? 'Automático: reduz sozinho se cair de 30 fps.' : 'Manual.'} />
        <Ctl rotulo="Giro" valor={p.speed} mostra={p.speed === 0 ? 'parado' : `${p.speed.toFixed(1)}°/s · volta em ${Math.round(360 / p.speed)} s`} min="0" max="20" step="0.5" onChange={muda('speed')} />
        <Ctl rotulo="Ângulo da câmera" valor={p.angle} mostra={`${Math.round(p.angle)}°`} min="5" max="80" step="1" onChange={muda('angle')} />
        <div className="btns">
          <button type="button" aria-pressed={p.angle === 40} onClick={() => setP((a) => ({ ...a, angle: 40 }))}>Alta · 40°</button>
          <button type="button" aria-pressed={p.angle === 18} onClick={() => setP((a) => ({ ...a, angle: 18 }))}>Perfil · 18°</button>
        </div>

        <h2>Traço</h2>
        <Ctl rotulo="Contorno" valor={p.borderWidth} mostra={`${p.borderWidth.toFixed(2)} px`} min="0.5" max="4" step="0.25" onChange={muda('borderWidth')} />
        <Ctl rotulo="Curvas de nível" valor={p.lineWidth} mostra={`${p.lineWidth.toFixed(2)} px`} min="0.25" max="2" step="0.05" onChange={muda('lineWidth')} />
        <Ctl rotulo="Profundidade" valor={p.depth} mostra={p.depth.toFixed(2)} min="0" max="1" step="0.05" onChange={muda('depth')}
          dica="Quanto as curvas do fundo se apagam no azul." />
        <Ctl rotulo="Aproximação" valor={p.zoom} mostra={`${p.zoom.toFixed(2)}×`} min="0.6" max="2" step="0.05" onChange={muda('zoom')} />
        <Ctl rotulo="Inclinação do mouse" valor={p.tilt} mostra={p.tilt.toFixed(1)} min="0" max="3" step="0.1" onChange={muda('tilt')} />

        <h2>Medida</h2>
        <dl className="medida">
          <div><dt>fps</dt><dd>{st && valeu === '3d' ? st.fps.toFixed(0) : '–'}</dd></div>
          <div><dt>CPU por quadro</dt><dd>{st && valeu === '3d' ? `${st.ms.toFixed(2)} ms` : '–'}</dd></div>
          <div><dt>Linhas</dt><dd>{st && valeu === '3d' ? st.lines : '–'}</dd></div>
          <div><dt>Pontos</dt><dd>{st && valeu === '3d' ? st.points.toLocaleString('pt-BR') : '–'}</dd></div>
        </dl>
        <div className="btns">
          <button type="button" onClick={mede} disabled={valeu !== '3d'}>Medir sem o teto da tela</button>
        </div>
        {carga && (
          <p className="ctl-dica" style={{ margin: '-6px 0 14px' }}>
            {carga.ms.toFixed(2)} ms por quadro, daria {Math.round(carga.fps)} fps. {carga.lines} linhas, tela de {carga.width}×{carga.height} px.
          </p>
        )}
        <div className="btns">
          {['auto', '3d', '2d'].map((m) => (
            <button key={m} type="button" aria-pressed={modo === m} onClick={() => setModo(m)}>{m === 'auto' ? 'Automático' : m === '3d' ? 'Forçar 3D' : 'Ver reserva 2D'}</button>
          ))}
        </div>

        <h2>Valores</h2>
        <pre>{texto}</pre>
        <div className="btns">
          <button type="button" onClick={copia}>{copiado ? 'Copiado' : 'Copiar'}</button>
          <button type="button" onClick={() => { setP(INICIAL); setAuto(true); }}>Voltar ao início</button>
        </div>
      </aside>
    </div>
  );
}
