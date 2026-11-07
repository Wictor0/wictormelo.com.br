// Textos da Home. Cada texto tem { pt, en }.
// Para editar um texto, mude aqui e rode `npm run dev` para conferir.

const A = (f) => `/assets/${f}`;

export const ui = {
  nav: [
    { id: 'sobre', pt: 'Sobre', en: 'About' },
    { id: 'obras', pt: 'Obras', en: 'Work' },
    { id: 'oficio', pt: 'Ofício', en: 'Craft' },
    { id: 'trajeto', pt: 'Trajeto', en: 'Path' },
    { id: 'contato', pt: 'Contato', en: 'Contact' },
  ],
  kicker: { pt: 'Portfólio 2026 / Design & desenvolvimento web', en: 'Portfolio 2026 / Web design & development' },
  seeWork: { pt: 'Ver obras ↘', en: 'See work ↘' },
  talk: { pt: 'Falar comigo ↘', en: 'Get in touch ↘' },
  heroAlt: { pt: 'Pôr do sol sobre o rio no Recife, visto de uma ponte através da grade', en: 'Sunset over the river in Recife, seen from a bridge through the railing' },
  heroMapAlt: { pt: 'Curvas de nível do litoral de Pernambuco, com uma coordenada marcada', en: 'Contour lines of the Pernambuco coast, with a marked coordinate' },
  portfolio26: { pt: 'Portfólio/ 26/', en: 'Portfolio/ 26/' },
  back: { pt: '← Voltar às obras', en: '← Back to work' },
  next: { pt: 'Próxima obra', en: 'Next work' },
  open: { pt: 'Abrir ↗', en: 'Open ↗' },
  top: { pt: 'Topo ↑', en: 'Top ↑' },
  cv: { pt: 'Baixar CV ↓', en: 'Download CV ↓' },
  notFound: { pt: 'Página não encontrada.', en: 'Page not found.' },
};

export const sobre = {
  label: { pt: '01 / Sobre', en: '01 / About' },
  photoAlt: { pt: 'Wictor sentado, de moletom laranja-amarronzado, sorrindo', en: 'Wictor sitting in a rust-orange hoodie, smiling' },
  albumTag: { pt: 'Sobre/ 26/', en: 'About/ 26/' },
  fichaTitle: { pt: 'Ficha técnica/', en: 'Fact sheet/' },
  ficha: [
    { k: { pt: 'Função', en: 'Role' }, v: { pt: 'Dev front-end / full-stack · Designer UI/UX', en: 'Front-end / full-stack dev · UI/UX designer' } },
    { k: { pt: 'Base', en: 'Based in' }, v: { pt: 'Recife, PE', en: 'Recife, Brazil' } },
    { k: { pt: 'Hoje', en: 'Now' }, v: { pt: 'Desenvolvedor de soluções digitais · SELVA Agency', en: 'Digital solutions developer · SELVA Agency' } },
    { k: { pt: 'Agência', en: 'Studio' }, v: { pt: '<a href="https://sotaqueagencia.com.br/" target="_blank" rel="noopener">Sotaque ↗</a> · cofundador', en: '<a href="https://sotaqueagencia.com.br/" target="_blank" rel="noopener">Sotaque ↗</a> · co-founder' } },
    { k: { pt: 'Formação', en: 'Education' }, v: { pt: 'ADS · Faculdade Nova Roma, 2027', en: 'Systems Analysis & Development · Faculdade Nova Roma, 2027' } },
    { k: { pt: 'Técnico', en: 'Technical' }, v: { pt: 'Redes de Computadores · ETEMERB', en: 'Computer Networks · ETEMERB' } },
    { k: { pt: 'Raiz', en: 'Roots' }, v: { pt: 'Olindense criado em Carpina', en: 'Born in Olinda, raised in Carpina' } },
    { k: { pt: 'Inglês', en: 'English' }, v: { pt: 'Avançado · C1 (EF SET)', en: 'Advanced · C1 (EF SET)' } },
    { k: { pt: 'Stack', en: 'Stack' }, v: { pt: 'React · React Native · Node.js · WordPress · Webflow · Shopify (Liquid) · n8n · ActiveCampaign · Figma', en: 'React · React Native · Node.js · WordPress · Webflow · Shopify (Liquid) · n8n · ActiveCampaign · Figma' } },
  ],
  // Manifesto: pedaços de texto e fotos em sequência. "hl" = destaque em Fell vermelha.
  manifesto: {
    pt: [
      ['t', 'Gosto de construir '], ['p', 'coisas', '/g/m-coisas.jpg', 2.3, '50% 50%', '.'],
      ['t', ' Às vezes é uma interface, às vezes um '], ['p', 'app', '/g/m-app.jpg', 2.8, '50% 50%', ','],
      ['t', ' às vezes um sistema inteiro que só aparece quando para de funcionar. Quase sempre, algo que eu '], ['hl', 'ainda nem sabia fazer'],
      ['t', ' quando '], ['p', 'comecei', '/g/m-comecei.jpg', 2.4, '50% 50%', '.'],
    ],
    en: [
      ['t', 'I like building '], ['p', 'things', '/g/m-coisas.jpg', 2.3, '50% 50%', '.'],
      ['t', ' Sometimes it is an interface, sometimes an '], ['p', 'app', '/g/m-app.jpg', 2.8, '50% 50%', ','],
      ['t', ' sometimes a whole system you only notice when it stops working. Almost always, something I '], ['hl', "didn't know how to do yet"],
      ['t', ' when I '], ['p', 'started', '/g/m-comecei.jpg', 2.4, '50% 50%', '.'],
    ],
  },
  cols: {
    pt: [
      'Sou desenvolvedor de soluções digitais na SELVA Agency desde 2025. Construo sites em WordPress, Webflow, Wix e Shopify, integro CRMs e e-commerces com n8n, APIs e webhooks e configuro hospedagem, domínios e DNS.',
      'Fora do expediente, construo produtos em times pequenos, em hackathons e projetos da faculdade. Costumo ficar entre o design e o código. Alguns desses projetos continuaram depois do evento, em incubação e editais públicos.',
      'Com minha irmã, toco a <a href="https://sotaqueagencia.com.br/" target="_blank" rel="noopener">Sotaque</a>, uma agência de design e desenvolvimento que faz sites e sistemas sob medida. Nos intervalos, construo ferramentas pequenas para pessoas próximas, que servem de laboratório para testar ferramentas novas.',
    ],
    en: [
      "I've been a digital solutions developer at SELVA Agency since 2025. I build sites in WordPress, Webflow, Wix and Shopify, connect CRMs and e-commerce stores with n8n, APIs and webhooks, and set up hosting, domains and DNS.",
      'Outside work, I build products in small teams, at hackathons and in university projects. I usually sit between design and code. Some of those projects kept going after the event, through incubation and public innovation calls.',
      'With my sister, I run <a href="https://sotaqueagencia.com.br/" target="_blank" rel="noopener">Sotaque</a>, a design and development studio that makes custom sites and systems. In between, I build small tools for people close to me, which double as a lab for trying out new tools.',
    ],
  },
};

export const obras = {
  label: { pt: '02 / Obras', en: '02 / Work' },
  title: { pt: 'Índice de obras', en: 'Index of work' },
  meta: { pt: '10 projetos · 2023 → 2026', en: '10 projects · 2023 → 2026' },
  cols: { pt: ['Nº', 'Projeto', 'Tipo', 'Papel', 'Período'], en: ['No.', 'Project', 'Type', 'Role', 'Period'] },
  // logo: dark = versão escura (img) ou mask = classe CSS de máscara; color = versão colorida no hover
  rows: [
    { slug: 'recria', c: '#2E9E6A', name: 'Recria', logo: { dark: A('recria-logo-dark.svg'), color: A('recria-logo-cor.svg'), h: 36, ar: '680 / 190' }, type: { pt: 'Economia circular', en: 'Circular economy' }, role: { pt: 'Dev · Design · Pitch', en: 'Dev · Design · Pitch' }, period: { pt: 'mai 2023 → hoje', en: 'May 2023 → now' } },
    { slug: 'agora', c: '#6B3468', name: 'Ágora', logo: { dark: A('8b5f3380595f.svg'), color: A('119e63adf1b4.svg'), h: 34, ar: '782 / 296' }, type: { pt: 'Networking para artistas', en: 'Networking for artists' }, role: { pt: 'UI · Identidade · Front-end', en: 'UI · Identity · Front-end' }, period: { pt: 'jul 2024 → nov 2025', en: 'Jul 2024 → Nov 2025' } },
    { slug: 'munganga', c: '#1A56B0', name: 'Munganga', logo: { dark: A('eaf3f1037eb9.svg'), color: A('d6cc1eb594e1.svg'), h: 40, ar: '925 / 588' }, type: { pt: 'Programação com IA', en: 'Coding with AI' }, role: { pt: 'Cofundador · UX/UI · Front-end', en: 'Co-founder · UX/UI · Front-end' }, period: { pt: 'ago 2024 → dez 2025', en: 'Aug 2024 → Dec 2025' } },
    { slug: 'copiba', c: '#3E6E9C', name: 'Copiba', logo: { mask: 'lg-copiba', color: A('139f4fd21462.svg'), h: 34, ar: '638 / 220' }, type: { pt: 'Sustentabilidade & gamificação', en: 'Sustainability & gamification' }, role: { pt: 'UX/UI · Identidade · Front-end', en: 'UX/UI · Identity · Front-end' }, period: { pt: 'fev → mar 2025', en: 'Feb → Mar 2025' } },
    { slug: 'econecta', c: '#0E9A4A', name: 'EConecta', logo: { dark: A('e43dff49afe4.svg'), color: A('8c9b424adc23.svg'), h: 26, ar: '885 / 159' }, type: { pt: 'Engajamento comunitário', en: 'Community engagement' }, role: { pt: 'UI · Identidade · Front-end', en: 'UI · Identity · Front-end' }, period: { pt: 'nov → dez 2024', en: 'Nov → Dec 2024' } },
    { slug: 'skill-sphere', c: '#7F1BAF', name: 'Skill Sphere', logo: { mask: 'lg-skill', color: A('f86c2223fa31.svg'), h: 40, ar: '556 / 366' }, type: { pt: 'Eventos & trilhas', en: 'Events & tracks' }, role: { pt: 'UX/UI · Identidade', en: 'UX/UI · Identity' }, period: { pt: 'dez 2024', en: 'Dec 2024' } },
    { slug: 'nivelo', c: '#1E8FC9', name: 'Nivelo', logo: { mask: 'lg-nivelo', color: A('e970206657b7.svg'), h: 34, ar: '781 / 253' }, type: { pt: 'Nivelamento escolar', en: 'School levelling' }, role: { pt: 'UX/UI · Identidade', en: 'UX/UI · Identity' }, period: { pt: 'out 2024', en: 'Oct 2024' } },
    { slug: 'asp-pe', c: '#0E7A3A', name: 'ASP-PE', logo: { mask: 'lg-asp', color: A('fcbdbced729e.png'), h: 44, ar: '410 / 415' }, type: { pt: 'Site institucional', en: 'Non-profit website' }, role: { pt: 'Dev web voluntário', en: 'Volunteer web dev' }, period: { pt: 'jan → mar 2025', en: 'Jan → Mar 2025' } },
    { slug: 'gozo-escopico', c: '#f85101', name: 'Gozo Escópico', logo: { mask: 'lg-gozo', color: A('e09edc8128ae.svg'), h: 40, ar: '516 / 200' }, type: { pt: 'App web de cinema · pessoal', en: 'Film web app · personal' }, role: { pt: 'Produto · Design · Full-stack', en: 'Product · Design · Full-stack' }, period: { pt: 'set 2026 → hoje', en: 'Sep 2026 → now' } },
    { slug: 'gozo-literario', c: '#F15833', name: 'Gozo Literário', logo: { mask: 'lg-literario', color: A('lit-logo.svg'), h: 44, ar: '1537 / 1023' }, type: { pt: 'Clube de leitura · pessoal', en: 'Reading club · personal' }, role: { pt: 'Produto · Design · Full-stack', en: 'Product · Design · Full-stack' }, period: { pt: 'set 2026 → hoje', en: 'Sep 2026 → now' } },
  ],
};

export const oficio = {
  label: { pt: '03 / Ofício', en: '03 / Craft' },
  title: { pt: 'Azulejaria digital:', en: 'Digital tilework:' },
  titleFell: { pt: 'cada peça encaixa na outra.', en: 'every piece fits the next.' },
  sub: { pt: 'Interface, código, automação e infraestrutura, um painel que só faz sentido inteiro.', en: 'Interface, code, automation and infrastructure, a panel that only makes sense whole.' },
  skills: [
    { n: '01', title: { pt: 'Front-end', en: 'Front-end' }, items: { pt: 'React · React Native · JavaScript · HTML · CSS · UI responsiva', en: 'React · React Native · JavaScript · HTML · CSS · Responsive UI' } },
    { n: '02', title: { pt: 'Back-end', en: 'Back-end' }, items: { pt: 'Node.js · REST APIs & webhooks · PHP · Python · C', en: 'Node.js · REST APIs & webhooks · PHP · Python · C' } },
    { n: '03', title: { pt: 'IA & automação', en: 'AI & automation' }, items: { pt: 'Claude Code · front-ends para produtos com IA · n8n', en: 'Claude Code · front-ends for AI products · n8n' } },
    { n: '04', title: { pt: 'Design', en: 'Design' }, items: { pt: 'UX/UI · Figma · Adobe Creative Suite · Canva', en: 'UX/UI · Figma · Adobe Creative Suite · Canva' } },
    { n: '05', title: { pt: 'Plataformas & infra', en: 'Platforms & infra' }, items: { pt: 'WordPress · Webflow · Wix · WooCommerce · HubSpot · hosting, DNS & redes', en: 'WordPress · Webflow · Wix · WooCommerce · HubSpot · hosting, DNS & networking' } },
  ],
};

export const trajeto = {
  label: { pt: '04 / Trajeto', en: '04 / Path' },
  title: { pt: 'Por onde passei', en: "Where I've been" },
  photoAlt: { pt: 'Rua do Bom Jesus, no Recife Antigo, com casarões coloridos', en: 'Rua do Bom Jesus in Old Recife, with colourful townhouses' },
  photoCap: { pt: 'Rua do Bom Jesus, Recife Antigo', en: 'Rua do Bom Jesus, Old Recife' },
  awardsLabel: { pt: 'Láureas', en: 'Awards' },
  path: [
    { when: { pt: '2025 → hoje', en: '2025 → now' }, type: { pt: 'Remoto', en: 'Remote' }, title: { pt: 'Digital Solutions Developer', en: 'Digital Solutions Developer' }, org: 'SELVA Agency', desc: { pt: 'Sites e aplicações em WordPress, Webflow e Wix; integrações via APIs, webhooks e n8n com HubSpot, RD Station, WooCommerce e Bling; hospedagem, domínios e DNS.', en: 'Sites and applications in WordPress, Webflow and Wix; integrations through APIs, webhooks and n8n with HubSpot, RD Station, WooCommerce and Bling; hosting, domains and DNS.' } },
    { when: { pt: '2025', en: '2025' }, type: { pt: 'Voluntariado', en: 'Volunteer' }, title: { pt: 'Desenvolvedor web', en: 'Web developer' }, org: 'ASP-PE', desc: { pt: 'Novo site responsivo da Associação de Parkinson de Pernambuco.', en: "New responsive website for the Parkinson's Association of Pernambuco." } },
    { when: { pt: '2024', en: '2024' }, type: { pt: 'Acadêmico', en: 'Academic' }, title: { pt: 'Monitor de Programação Estruturada', en: 'Structured Programming teaching assistant' }, org: 'UniFBV Wyden', desc: { pt: 'Apoio a estudantes em lógica de programação e linguagem C.', en: 'Helped students with programming logic and the C language.' } },
    { when: { pt: '2026 → 2027', en: '2026 → 2027' }, type: { pt: 'Formação', en: 'Education' }, title: { pt: 'Tecnólogo em ADS', en: 'Systems Analysis & Development' }, org: 'Faculdade Nova Roma', desc: { pt: 'Depois de iniciar Ciência da Computação na UniFBV Wyden (de 2024 a 2026).', en: 'After starting Computer Science at UniFBV Wyden (2024 to 2026).' } },
    { when: { pt: '2021 → 2023', en: '2021 → 2023' }, type: { pt: 'Formação', en: 'Education' }, title: { pt: 'Técnico em Redes', en: 'Computer Networks technician' }, org: 'ETEMERB', desc: { pt: 'A base que me deixa à vontade perto da infraestrutura.', en: 'The foundation that makes me comfortable around infrastructure.' } },
  ],
  awards: [
    { rank: { pt: '1º', en: '1st' }, c: '#B4271D', title: 'Hedera HelloFuture Hackathon', desc: { pt: 'Time vencedor com o Ágora, num hackathon internacional.', en: 'Winning team with Ágora, at an international hackathon.' }, year: '2024' },
    { rank: { pt: '2º', en: '2nd' }, c: '#1E3540', title: 'Hacker Cidadão 12.0', desc: { pt: 'Copiba, impacto socioambiental com IA.', en: 'Copiba, social and environmental impact with AI.' }, year: '2025' },
    { rank: { pt: '4º/34', en: '4th/34' }, c: '#1E3540', title: { pt: 'Edital GovTech de Inovação Aberta', en: 'GovTech Open Innovation call' }, desc: { pt: 'Projeto Recria aprovado.', en: 'Recria project approved.' }, year: { pt: 's/d', en: 'n.d.' } },
    { rank: { pt: 'Incubação', en: 'Incubation' }, c: '#1E3540', title: 'PoloTec UFPE', desc: { pt: 'Ágora aceito na pré-incubação.', en: 'Ágora accepted into pre-incubation.' }, year: '2025' },
    { rank: { pt: 'Palco', en: 'Stage' }, c: '#1E3540', title: 'Rec’n’Play 2024', desc: { pt: 'Munganga apresentado no festival.', en: 'Munganga presented at the festival.' }, year: '2024' },
  ],
};

// Galeria: posição no grid de 6 colunas x 4 linhas
export const galeria = [
  { src: '/g/g-01.jpg', col: '1 / span 2', row: '1 / span 2', alt: { pt: 'Oficina Brennand, Várzea', en: 'Oficina Brennand, Várzea' } },
  { src: '/g/g-02.jpg', col: '3 / span 1', row: '1 / span 2', alt: { pt: 'Estátua da Naná no Marco Zero', en: 'Naná statue at Marco Zero' } },
  { src: '/g/g-03.jpg', col: '4 / span 1', row: '1 / span 1', alt: { pt: 'Iara, a gata, no escuro', en: 'Iara the cat, in the dark' } },
  { src: '/g/g-04.jpg', col: '5 / span 2', row: '1 / span 2', alt: { pt: 'Sala com a bandeira de Pernambuco na parede', en: 'A room with the Pernambuco flag on the wall' } },
  { src: '/g/g-05.jpg', col: '4 / span 1', row: '2 / span 1', alt: { pt: 'Camisa estampada com a bandeira de Pernambuco', en: 'Shirt printed with the Pernambuco flag' } },
  { src: '/g/g-06.jpg', col: '1 / span 1', row: '3 / span 2', alt: { pt: 'Cadeira de salva-vidas diante do mar', en: 'Lifeguard chair facing the sea' } },
  { src: '/g/g-07.jpg', col: '2 / span 2', row: '3 / span 2', bg: '#b4271d', alt: { pt: 'Wictor de costas, olhando pela janela', en: 'Wictor from behind, looking out of a window' } },
  { src: '/g/g-08.jpg', col: '4 / span 1', row: '3 / span 2', alt: { pt: 'Janela à noite', en: 'A window at night' } },
  { src: '/g/g-09.jpg', col: '5 / span 1', row: '3 / span 2', alt: { pt: 'Wictor na beira da praia', en: 'Wictor at the shoreline' } },
  { src: '/g/g-10.jpg', col: '6 / span 1', row: '3 / span 2', alt: { pt: 'Mar e areia com cordas e sombras', en: 'Sea and sand with ropes and shadows' } },
];

export const contato = {
  label: { pt: '05 / Contato', en: '05 / Contact' },
  title: { pt: 'Bora construir', en: "Let's build" },
  titleFell: { pt: 'algo com sotaque?', en: 'something with an accent?' },
  email: 'wictormannuel@gmail.com',
  photoAlt: { pt: 'Barraca de surf na praia ao entardecer, com as bandeiras do Brasil e de Pernambuco entre coqueiros', en: 'A surf shack on the beach at dusk, with the Brazil and Pernambuco flags among palm trees' },
  peAlt: { pt: 'Mapa topográfico completo de Pernambuco em curvas de nível', en: 'Full topographic map of Pernambuco in contour lines' },
  peLine: { pt: 'Do litoral ao sertão/', en: 'From the coast to the sertão/' },
  links: [
    { label: 'LinkedIn ↗', href: 'https://www.linkedin.com/in/wictormelo' },
    { label: 'GitHub ↗', href: 'https://github.com/wictor0' },
    { label: 'Behance ↗', href: 'https://www.behance.net/wictormeloo' },
  ],
};

// Currículos em public/cv/. O botão baixa o do idioma escolhido.
export const CV_URL = { pt: '/cv/wictor-melo-curriculo.pdf', en: '/cv/wictor-melo-cv-en.pdf' };
