# wictormelo.com.br

Portfólio de Wictor Melo. React + Vite, publicado no GitHub Pages pela branch `gh-pages`.

## Rodar no computador

    npm install
    npm run dev

## Onde mexer

- `src/data/content.js`: textos da Home (pt e en), lista de obras, galeria, trajeto.
- `src/data/cases.js`: textos e imagens das páginas de case.
- `src/sections/`: uma seção da Home por arquivo.
- `src/pages/CasePage.jsx`: o modelo único das páginas de case.
- `src/styles/global.css`: estilos.
- `public/assets/`: fotos e logos.

## Publicar

    git push          # guarda o código na main
    npm run deploy    # gera o site e envia para a branch gh-pages, que o GitHub Pages publica
