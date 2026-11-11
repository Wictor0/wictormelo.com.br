// wictormelo.com.br/pernambuco: o relevo 3D em tela cheia, com endereço próprio.
// Chega-se aqui pelo botão Explorar do mapa do Contato, pelo link do rodapé ou
// por um link direto. "Fechar" volta para o mapa do Contato.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n.jsx';
import { Explorar, RELEVO_TEXT } from '../relief/Relevo.jsx';

export default function Pernambuco() {
  const t = useT();
  const navigate = useNavigate();
  const text = t(RELEVO_TEXT);
  useEffect(() => { document.title = `${text.pageTitle}, Wictor Melo`; }, [text.pageTitle]);
  // ao fechar, o relevo sai na hora (para de desenhar e devolve a rolagem) e a
  // cortina leva de volta ao Contato
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => { setClosing(true); navigate('/', { state: { to: 'pe-mapa' } }); }, [navigate]);
  return closing ? null : <Explorar text={text} onClose={close} page />;
}
