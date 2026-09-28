/*
 * Gera as partes do site que o Google e as IAs leem sem rodar JavaScript:
 *  - lista de produtos já pronta no index.html (a página continua interativa)
 *  - metatags, Open Graph e dados estruturados (JSON-LD)
 *  - páginas institucionais: sobre, contato, divulgação, privacidade, termos
 *  - sitemap.xml, robots.txt, llms.txt e 404.html
 *
 * Rode depois de editar js/produtos.js:
 *     node ferramentas/gerar.mjs
 * (o GitHub Actions também roda sozinho quando produtos.js muda na main)
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const PASTA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAIZ_REPO = path.resolve(PASTA, "..");

// Data das políticas: mude quando alterar o texto delas
const DATA_POLITICAS = "2026-09-28";

/* ---------- dados ---------- */
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(PASTA, "js/produtos.js"), "utf8"), ctx);
const { CONFIG, CATEGORIAS, PRODUTOS } = ctx.window;
const URL_SITE = CONFIG.urlSite.endsWith("/") ? CONFIG.urlSite : CONFIG.urlSite + "/";
const NOME = CONFIG.nomeLoja || "StoreNow";
const EMAIL = (CONFIG.emailContato || "").trim();
const HOJE = new Date().toISOString().slice(0, 10);

const LOJAS = {
  amazon: { nome: "Amazon", na: "na Amazon", classe: "bolinha--amazon" },
  mercadolivre: { nome: "Mercado Livre", na: "no Mercado Livre", classe: "bolinha--ml" },
};
const temML = PRODUTOS.some((p) => p.loja === "mercadolivre");

const esc = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const nomeCategoria = (c) => (CATEGORIAS[c] && CATEGORIAS[c].nome) || c;
function linkDe(p) {
  if (p.link) return p.link;
  if (p.loja === "amazon" && p.asin) {
    const url = "https://www.amazon.com.br/dp/" + encodeURIComponent(p.asin);
    return CONFIG.tagAmazon ? url + "?tag=" + encodeURIComponent(CONFIG.tagAmazon) : url;
  }
  return "#";
}
function fotoDe(p) {
  if (!p.imagem) return "";
  if (/^https?:\/\//.test(p.imagem)) return p.imagem;
  return "https://m.media-amazon.com/images/I/" + p.imagem + "._AC_SL500_.jpg";
}
function dataBR(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${d} de ${meses[m - 1]} de ${a}`;
}
function trocarEntre(texto, marca, novo) {
  const ini = `<!-- GERADO:${marca} -->`;
  const fim = `<!-- /GERADO:${marca} -->`;
  const a = texto.indexOf(ini);
  const b = texto.indexOf(fim);
  if (a < 0 || b < 0) throw new Error(`Marcador ${marca} não encontrado no index.html`);
  return texto.slice(0, a + ini.length) + "\n" + novo + "\n" + texto.slice(b);
}
function escrever(arquivo, conteudo) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, conteudo);
  console.log("✓", path.relative(RAIZ_REPO, arquivo));
}

/* ---------- index.html ---------- */
const DESCRICAO =
  "Compare fones de ouvido Bluetooth da Amazon com cancelamento de ruído, intra-auriculares, headphones e esportivos. Guia rápido para escolher e links direto para a loja.";
const TITULO = `Fones de Ouvido Bluetooth: os melhores da Amazon | ${NOME}`;

const GUIA = [
  ["O que é cancelamento de ruído (ANC)?", "Microfones captam o barulho de fora e o fone emite um som oposto para anular. Vale muito para ônibus, metrô e avião. Adaptativo ajusta a força sozinho conforme o ambiente."],
  ["Quanto de bateria um fone Bluetooth precisa ter?", "Nos intra-auriculares, o número anunciado costuma somar o fone e as recargas do estojo. Headphones grandes passam fácil de 50 horas com uma carga."],
  ["O que significa IPX4 e IPX5?", "O segundo número do código IP indica a proteção contra água. IPX4 aguenta respingos e suor; IPX5 aguenta jatos d’água. Para treinar, prefira IPX4 ou mais."],
  ["O que é conexão multiponto?", "Conecta o fone em dois aparelhos ao mesmo tempo, como celular e notebook, e troca sozinho quando chega uma ligação."],
];

function cartao(p, i) {
  const loja = LOJAS[p.loja] || LOJAS.amazon;
  const link = esc(linkDe(p));
  const specs = (p.specs || []).slice(0, 3);
  return (
    `<li class="cartao">` +
    `<a class="cartao__img" href="${link}" target="_blank" rel="nofollow sponsored noopener" aria-label="${esc(p.nome)} ${loja.na}">` +
    (p.imagem
      ? `<img class="foto" src="${esc(fotoDe(p))}" alt="${esc(p.nome)}" loading="lazy" referrerpolicy="no-referrer" data-i="${i}" />`
      : "") +
    `<span class="cartao__ver">Ver oferta <span aria-hidden="true">↗</span></span></a>` +
    `<div class="cartao__info"><div>` +
    `<h3 class="cartao__nome"><a href="${link}" target="_blank" rel="nofollow sponsored noopener">${esc(p.nome)}</a></h3>` +
    `<p class="cartao__loja"><i class="bolinha ${loja.classe}"></i>${loja.nome} · ${esc(nomeCategoria(p.categoria))}</p>` +
    (specs.length ? `<ul class="specs">${specs.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "") +
    `</div></div></li>`
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": URL_SITE + "#org",
      name: NOME,
      url: URL_SITE,
      logo: URL_SITE + "logo.png",
      ...(EMAIL ? { email: EMAIL } : {}),
    },
    {
      "@type": "WebSite",
      "@id": URL_SITE + "#site",
      name: NOME,
      url: URL_SITE,
      inLanguage: "pt-BR",
      description: DESCRICAO,
      publisher: { "@id": URL_SITE + "#org" },
    },
    {
      "@type": "ItemList",
      name: "Fones de ouvido Bluetooth escolhidos",
      numberOfItems: PRODUTOS.length,
      itemListElement: PRODUTOS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.nome,
        url: linkDe(p),
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: GUIA.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

function metaSEO({ titulo, descricao, url }) {
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta name="theme-color" content="#0e0e10" />`,
    `<link rel="icon" href="${URL_SITE}favicon.svg" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="${URL_SITE}logo.png" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:site_name" content="${esc(NOME)}" />`,
    `<meta property="og:title" content="${esc(titulo)}" />`,
    `<meta property="og:description" content="${esc(descricao)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${URL_SITE}og.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n");
}

let index = fs.readFileSync(path.join(PASTA, "index.html"), "utf8");
index = trocarEntre(
  index,
  "SEO",
  metaSEO({ titulo: TITULO, descricao: DESCRICAO, url: URL_SITE }) +
    `\n<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 1)}\n</script>`
);
index = trocarEntre(index, "GRADE", PRODUTOS.map(cartao).join("\n"));
escrever(path.join(PASTA, "index.html"), index);

/* ---------- páginas institucionais ---------- */
const categoriasRodape = (inicio) =>
  Object.keys(CATEGORIAS)
    .map((k) => `<a href="${inicio}#indicados">${esc(CATEGORIAS[k].nome)}</a>`)
    .join("\n      ");

function pagina({ arquivo, titulo, h1, descricao, corpo, absoluto = false }) {
  const url = URL_SITE + arquivo;
  // páginas dentro da pasta usam caminhos relativos; o 404 (na raiz do repositório) usa absolutos
  const R = absoluto ? URL_SITE : "";
  const inicio = absoluto ? URL_SITE : "./";
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: h1,
    url,
    inLanguage: "pt-BR",
    isPartOf: { "@id": URL_SITE + "#site" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: NOME, item: URL_SITE },
        { "@type": "ListItem", position: 2, name: h1, item: url },
      ],
    },
  };
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(titulo)} | ${esc(NOME)}</title>
<meta name="description" content="${esc(descricao)}" />
${metaSEO({ titulo: `${titulo} | ${NOME}`, descricao, url })}
<script type="application/ld+json">
${JSON.stringify(ld, null, 1)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="${R}css/estilo.css" />
</head>
<body>
<header class="topo">
  <div class="topo__inner">
    <a class="marca" href="${inicio}" aria-label="Início"><span class="marca__nome">${esc(NOME)}</span><span class="marca__ponto">.</span></a>
    <div class="topo__acoes">
      <a class="pill pill--preto" href="${inicio}#indicados">Ver os fones</a>
    </div>
  </div>
</header>
<main class="texto">
  <nav class="texto__trilha" aria-label="Você está em"><a href="${inicio}">${esc(NOME)}</a> / ${esc(h1)}</nav>
  <h1 class="texto__titulo">${esc(h1)}</h1>
${corpo}
</main>
<footer class="rodape">
  <div class="rodape__colunas">
    <div>
      <h3>Categorias</h3>
      ${categoriasRodape(inicio)}
    </div>
    <div>
      <h3>Guia</h3>
      <a href="${inicio}#guia">Como escolher seu fone</a>
      <a href="${inicio}#colecoes">Coleções</a>
    </div>
    <div>
      <h3>Institucional</h3>
      <a href="${R}sobre.html">Sobre</a>
      <a href="${R}contato.html">Contato</a>
      <a href="${R}divulgacao.html">Divulgação de afiliados</a>
      <a href="${R}privacidade.html">Política de privacidade</a>
      <a href="${R}termos.html">Termos de uso</a>
    </div>
    <div class="rodape__divulgacao">
      <h3>Divulgação</h3>
      <p>Como Associado da Amazon, recebo por compras qualificadas.${temML ? " Este site também participa do Programa de Afiliados do Mercado Livre." : ""} Preços e disponibilidade podem mudar; confira sempre na página da loja.</p>
    </div>
  </div>
  <p class="rodape__marca" aria-hidden="true">${esc(NOME)}.</p>
  <div class="rodape__base">
    <span>© ${HOJE.slice(0, 4)} ${esc(NOME)}</span>
    <span>Efeito 3D baseado em codrops-noise-transition (MIT)</span>
  </div>
</footer>
</body>
</html>
`;
}

const contatoLinha = EMAIL
  ? `<p>E-mail: <a href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a></p>`
  : `<p>O e-mail de contato será publicado aqui em breve.</p>`;
const grupoLinha =
  CONFIG.linkGrupo && CONFIG.linkGrupo !== "#"
    ? `<p>Ofertas e novidades: <a href="${esc(CONFIG.linkGrupo)}" rel="noopener">grupo de ofertas</a>.</p>`
    : "";
const atualizado = `<p class="texto__data">Última atualização: ${dataBR(DATA_POLITICAS)}.</p>`;

const PAGINAS = [
  {
    arquivo: "sobre.html",
    titulo: "Sobre o site",
    h1: `Sobre o ${NOME}`,
    descricao: `O que é o ${NOME}, como os fones de ouvido Bluetooth são escolhidos e como o site se mantém.`,
    corpo: `
  <p>O ${esc(NOME)} é uma vitrine de <strong>fones de ouvido Bluetooth</strong> vendidos na Amazon. A ideia é simples: juntar num lugar só os modelos que valem a pena olhar, separados pelo jeito que você vai usar o fone.</p>
  <h2>Como os fones são escolhidos</h2>
  <p>Os produtos são selecionados a partir das informações públicas de cada página na Amazon: ficha técnica, recursos anunciados pelo fabricante, disponibilidade e avaliações de compradores. As características mostradas nos cartões (bateria, cancelamento de ruído, resistência à água) vêm dessas fichas.</p>
  <p>O ${esc(NOME)} não testa os fones pessoalmente e não publica notas próprias. Antes de comprar, leia a página do produto na loja.</p>
  <h2>Como o site se mantém</h2>
  <p>Quando você compra pelos nossos links, a loja paga uma pequena comissão ao site. O preço para você é o mesmo. Veja os detalhes em <a href="divulgacao.html">Divulgação de afiliados</a>.</p>
  <h2>Fale com a gente</h2>
  <p>Encontrou um link quebrado ou uma informação errada? Veja como falar com a gente na página de <a href="contato.html">Contato</a>.</p>`,
  },
  {
    arquivo: "contato.html",
    titulo: "Contato",
    h1: "Contato",
    descricao: `Como falar com o ${NOME}: dúvidas, correções de informação e parcerias.`,
    corpo: `
  <p>Use o contato abaixo para avisar sobre links quebrados, informações erradas, dúvidas sobre privacidade ou propostas de parceria.</p>
  ${contatoLinha}
  ${grupoLinha}
  <h2>Sobre pedidos e entregas</h2>
  <p>O ${esc(NOME)} não vende produtos. Pedidos, pagamentos, entregas, trocas e garantia são tratados diretamente com a loja onde você comprou (por exemplo, o atendimento da Amazon).</p>`,
  },
  {
    arquivo: "divulgacao.html",
    titulo: "Divulgação de afiliados",
    h1: "Divulgação de afiliados",
    descricao: `Como o ${NOME} ganha comissão com links de afiliado da Amazon${temML ? " e do Mercado Livre" : ""}.`,
    corpo: `
  ${atualizado}
  <p><strong>Como Associado da Amazon, recebo por compras qualificadas.</strong></p>
  <p>O ${esc(NOME)} participa do Programa de Associados da Amazon${temML ? " e do Programa de Afiliados do Mercado Livre" : ""}. Os links para produtos neste site são links de afiliado: quando você clica e compra, a loja paga uma comissão ao site.</p>
  <ul>
    <li>Você paga o mesmo preço, com ou sem o nosso link.</li>
    <li>A compra, o pagamento e a entrega acontecem inteiramente na loja.</li>
    <li>A comissão não muda quais produtos aparecem nem a ordem deles.</li>
    <li>Preços e disponibilidade mudam com frequência. O valor que vale é o mostrado na página da loja no momento da compra.</li>
  </ul>
  <p>Os links de afiliado deste site são marcados com o atributo <code>rel="sponsored"</code>, como recomenda o Google.</p>`,
  },
  {
    arquivo: "privacidade.html",
    titulo: "Política de privacidade",
    h1: "Política de privacidade",
    descricao: `Quais dados o ${NOME} trata, quais serviços de terceiros o site usa e seus direitos pela LGPD.`,
    corpo: `
  ${atualizado}
  <p>Esta política explica como o ${esc(NOME)} trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).</p>
  <h2>Dados que o site coleta</h2>
  <p>O ${esc(NOME)} não tem cadastro, formulário, login nem ferramenta própria de análise de visitas. O site não pede e não guarda seu nome, e-mail ou telefone.</p>
  <h2>Serviços de terceiros</h2>
  <p>Para funcionar, o site carrega recursos de outros serviços. Ao abrir a página, seu navegador se conecta a eles, que podem registrar dados técnicos como endereço IP, tipo de navegador e data de acesso, conforme as políticas de cada um:</p>
  <ul>
    <li><strong>GitHub Pages</strong> (hospedagem do site).</li>
    <li><strong>Google Fonts</strong> (fonte dos textos).</li>
    <li><strong>jsDelivr</strong> (biblioteca Three.js do efeito 3D).</li>
    <li><strong>Amazon</strong> (fotos dos produtos).</li>
  </ul>
  <h2>Links de afiliado e cookies</h2>
  <p>Quando você clica num link de produto, sai do ${esc(NOME)} e vai para a loja. A loja pode usar cookies para identificar que a visita veio do nosso link e pagar a comissão. Esse tratamento segue a política de privacidade da própria loja.</p>
  <h2>Seus direitos</h2>
  <p>Pela LGPD, você pode pedir confirmação de tratamento, acesso, correção ou exclusão de dados pessoais. Como o site não guarda dados de visitantes, pedidos sobre dados registrados pelos serviços acima devem ser feitos a cada um deles. Para qualquer dúvida sobre esta política, veja a página de <a href="contato.html">Contato</a>.</p>
  <h2>Mudanças</h2>
  <p>Esta política pode ser atualizada. A data no topo mostra a versão em vigor.</p>`,
  },
  {
    arquivo: "termos.html",
    titulo: "Termos de uso",
    h1: "Termos de uso",
    descricao: `Regras de uso do ${NOME}: conteúdo informativo, links para lojas e responsabilidades.`,
    corpo: `
  ${atualizado}
  <p>Ao usar o ${esc(NOME)}, você concorda com estes termos.</p>
  <h2>Conteúdo informativo</h2>
  <p>O site reúne informações sobre fones de ouvido Bluetooth para ajudar na escolha. As características mostradas vêm das páginas dos produtos e podem mudar. Confirme sempre na loja antes de comprar.</p>
  <h2>Compras</h2>
  <p>O ${esc(NOME)} não vende produtos. Toda compra é feita na loja de destino, que é a única responsável por preço, pagamento, entrega, troca e garantia.</p>
  <h2>Links externos</h2>
  <p>O site tem links para lojas e outros sites. Não controlamos o conteúdo nem as práticas desses sites.</p>
  <h2>Marcas e imagens</h2>
  <p>Nomes de produtos, marcas e fotos pertencem aos seus donos e aparecem aqui só para identificar os produtos.</p>
  <h2>Isenção de garantias</h2>
  <p>O conteúdo é oferecido como está. Fazemos o possível para mantê-lo correto, mas não garantimos que esteja sempre completo ou atualizado.</p>
  <h2>Lei aplicável</h2>
  <p>Estes termos seguem as leis do Brasil.</p>`,
  },
];

for (const p of PAGINAS) escrever(path.join(PASTA, p.arquivo), pagina(p));

/* 404: o GitHub Pages usa o 404.html da raiz do repositório */
escrever(
  path.join(RAIZ_REPO, "404.html"),
  pagina({
    arquivo: "404.html",
    titulo: "Página não encontrada",
    h1: "Página não encontrada",
    descricao: "O endereço que você abriu não existe.",
    corpo: `
  <p>Esse endereço não existe ou mudou de lugar.</p>
  <p><a class="pill pill--preto" href="${URL_SITE}">Voltar para os fones</a></p>`,
    absoluto: true,
  }).replace('<meta name="robots" content="index, follow, max-image-preview:large" />', '<meta name="robots" content="noindex" />')
);

/* ---------- sitemap.xml ---------- */
const urls = [
  { loc: URL_SITE, lastmod: HOJE, prioridade: "1.0" },
  ...PAGINAS.map((p) => ({ loc: URL_SITE + p.arquivo, lastmod: DATA_POLITICAS, prioridade: "0.3" })),
];
escrever(
  path.join(PASTA, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.prioridade}</priority></url>`).join("\n")}
</urlset>
`
);

/* ---------- robots.txt (vale na raiz do domínio) ---------- */
const robots = `# Todos os robôs, inclusive de busca por IA, podem ler o site
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${URL_SITE}sitemap.xml
`;
escrever(path.join(RAIZ_REPO, "robots.txt"), robots);

/* ---------- llms.txt (resumo do site para IAs) ---------- */
const porCategoria = Object.keys(CATEGORIAS)
  .map((k) => {
    const itens = PRODUTOS.filter((p) => p.categoria === k);
    if (!itens.length) return "";
    return (
      `## ${CATEGORIAS[k].nome}\n\n` +
      itens
        .map((p) => `- [${p.nome}](${linkDe(p)}): ${(p.specs || []).join(", ") || nomeCategoria(p.categoria)}. Vendido ${(LOJAS[p.loja] || LOJAS.amazon).na}.`)
        .join("\n")
    );
  })
  .filter(Boolean)
  .join("\n\n");

const llms = `# ${NOME}

> Vitrine em português (Brasil) de fones de ouvido Bluetooth vendidos na Amazon, separados por uso: cancelamento de ruído, intra-auriculares, headphones e esportivos. Os links de produto são links de afiliado.

As características listadas vêm das páginas oficiais dos produtos na loja. O site não vende produtos, não testa os fones pessoalmente e não mostra preços, porque eles mudam com frequência; o preço válido é o da página da loja.

${porCategoria}

## Como escolher

${GUIA.map(([q, a]) => `- ${q} ${a}`).join("\n")}

## Páginas

- [Início](${URL_SITE}): todos os fones e o guia de escolha
- [Sobre](${URL_SITE}sobre.html): como os fones são escolhidos
- [Divulgação de afiliados](${URL_SITE}divulgacao.html): como o site recebe comissão
- [Política de privacidade](${URL_SITE}privacidade.html)
- [Termos de uso](${URL_SITE}termos.html)
- [Contato](${URL_SITE}contato.html)
`;
escrever(path.join(PASTA, "llms.txt"), llms);
escrever(path.join(RAIZ_REPO, "llms.txt"), llms);

console.log(`\nPronto: ${PRODUTOS.length} produtos, ${PAGINAS.length} páginas institucionais.`);
