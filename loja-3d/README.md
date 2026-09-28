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
3. `robots.txt`, `llms.txt`, `404.html` e `.htaccess` ficam nesta pasta, que é a raiz do site
   na hospedagem.

## Como ver no seu computador

O navegador não carrega os scripts 3D abrindo o arquivo direto (`file://`). Rode um servidor simples
dentro desta pasta:

```bash
python3 -m http.server 8000
```

e abra `http://localhost:8000`.

## Como publicar na Hostinger (fones.alishop4.com.br)

1. Gere o ZIP: `node ferramentas/pacote.mjs` (cria `site-hostinger.zip` na raiz do repositório).
2. No hPanel, crie o subdomínio `fones` em `alishop4.com.br` e veja qual pasta ele usa.
3. No Gerenciador de Arquivos, abra **a pasta do subdomínio** (não a `public_html` principal, que
   é do WordPress), envie o ZIP e escolha **Extrair**. O `index.html` deve ficar direto nessa pasta.
4. Ative o SSL do subdomínio e abra `https://fones.alishop4.com.br`.

Sempre que mudar os produtos, gere o ZIP de novo e repita o passo 3.
O endereço oficial fica em `CONFIG.urlSite` (`js/produtos.js`).

## Créditos

- Efeito 3D baseado em [codrops-noise-transition](https://github.com/mohAmineBrs/codrops-noise-transition) (licença MIT).
- As fotos dos produtos são carregadas direto do servidor de imagens da Amazon (`m.media-amazon.com`).
- Three.js (licença MIT).
