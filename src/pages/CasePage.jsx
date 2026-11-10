// A página de case sai do pacote inicial: só é baixada quando alguém abre uma obra.
// Depois que a Home carrega, o navegador busca o pacote em segundo plano,
// então o clique em uma obra não espera rede.
import { lazy, Suspense } from 'react';

const load = () => import('./CasePageImpl.jsx');
const Impl = lazy(load);

if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
  idle(() => { load(); });
}

export default function CasePage() {
  return (
    <Suspense fallback={null}>
      <Impl />
    </Suspense>
  );
}
