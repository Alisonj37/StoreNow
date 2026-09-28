# StoreNow — fones de ouvido Bluetooth (loja de afiliados 3D)

Vitrine em português (BR) de um nicho só: **fones de ouvido Bluetooth**, com produtos reais
da Amazon e a foto do produto em 3D no topo (WebGL/Three.js). Funciona no computador e no celular.

Por que esse nicho: segundo o Semrush (base Brasil, consulta de 28/09/2026), “fone de ouvido
bluetooth” tem cerca de 301 mil buscas por mês, “fone bluetooth” 74 mil e “fone sem fio” 40,5 mil.
São estimativas; confira no Semrush antes de decisões grandes.

## Como editar os produtos

Abra `js/produtos.js`.

1. **Coloque sua tag da Amazon** em `CONFIG.tagAmazon` (ex.: `"seunome-20"`). O site monta o link
   de afiliado de cada produto com o ASIN + sua tag. Sem a tag, os links abrem a Amazon **sem comissão**.
2. Para trocar ou adicionar um fone, copie um bloco e mude `nome`, `asin`, `categoria` e `specs`.
   O ASIN fica na URL do produto: `amazon.com.br/dp/ASIN`.
3. `imagem` é o código da foto na Amazon: abra a foto do produto, copie o trecho depois de
   `/images/I/` e antes do primeiro ponto (ex.: `51TL2aLCIpL`). Também aceita uma URL completa.
4. Se você já tem um link pronto (ex.: `https://link.amazon/...`), coloque em `link`; ele tem prioridade.
5. `destaque: true` coloca o produto no carrossel 3D do topo (até 4).
6. Mercado Livre: adicione produtos com `loja: "mercadolivre"` e o link gerado na Central de Afiliados
   em `link`. Os botões e filtros do Mercado Livre aparecem sozinhos quando houver produtos dele.

Não coloque preço fixo: a Amazon pede preço atualizado da fonte oficial.

## Google e IAs (SEO)

Depois de editar `js/produtos.js`, rode:

```bash
node ferramentas/gerar.mjs
```

Ele atualiza o que os robôs de busca leem sem rodar JavaScript: a lista de produtos dentro do
`index.html`, metatags, Open Graph, dados estruturados (JSON-LD), as páginas institucionais
(`sobre`, `contato`, `divulgacao`, `privacidade`, `termos`), `sitemap.xml`, `llms.txt`,
`robots.txt` e `404.html`. Se você editar `produtos.js` direto no GitHub (branch `main`), o
GitHub Actions roda isso sozinho (`.github/workflows/gerar-paginas.yml`).

Em `CONFIG`, preencha `urlSite` (endereço público do site) e `emailContato` (aparece em Contato).

Depois que o site estiver no ar:
1. Cadastre o endereço no **Google Search Console** e envie o `sitemap.xml`.
2. Faça o mesmo no **Bing Webmaster Tools** (o Bing também alimenta buscas de algumas IAs).
3. `robots.txt` e `llms.txt` só valem na raiz do domínio. No endereço `github.io/StoreNow/` eles
   não são lidos; passam a valer se você ligar um domínio próprio ao repositório.

## Como ver no seu computador

O navegador não carrega os scripts 3D abrindo o arquivo direto (`file://`). Rode um servidor simples
dentro desta pasta:

```bash
python3 -m http.server 8000
```

e abra `http://localhost:8000`.

## Como publicar grátis (GitHub Pages)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em *Source*, escolha **Deploy from a branch**, selecione a branch e a pasta `/ (root)`.
3. O site fica em `https://<seu-usuario>.github.io/StoreNow/loja-3d/`.

## Créditos

- Efeito 3D baseado em [codrops-noise-transition](https://github.com/mohAmineBrs/codrops-noise-transition) (licença MIT).
- As fotos dos produtos são carregadas direto do servidor de imagens da Amazon (`m.media-amazon.com`).
- Three.js (licença MIT).
