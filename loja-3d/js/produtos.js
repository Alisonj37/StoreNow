/*
 * ============================================================
 *  PRODUTOS DA LOJA — edite só este arquivo
 * ============================================================
 *  Nicho: FONES DE OUVIDO BLUETOOTH.
 *  Produtos reais da Amazon.com.br encontrados pelo PostMulti IA
 *  (busca de 28/09/2026). Confira se continuam à venda.
 *
 *  PASSO ÚNICO: coloque sua tag de associado da Amazon em
 *  CONFIG.tagAmazon (ex.: "seunome-20"). O site monta o link de
 *  afiliado de cada produto a partir do ASIN + sua tag.
 *
 *  Campos de cada produto:
 *   nome       – nome que aparece no cartão
 *   loja       – "amazon" ou "mercadolivre"
 *   categoria  – uma das chaves de CATEGORIAS (abaixo)
 *   asin       – código do produto na Amazon (fica na URL: /dp/ASIN)
 *   link       – (opcional) link de afiliado pronto. Se existir, é usado
 *                no lugar do ASIN + tag. Obrigatório para Mercado Livre.
 *   imagem     – código da foto na Amazon (o trecho depois de /images/I/),
 *                ou uma URL completa. Sem imagem, o site gera uma arte.
 *   specs      – até 3 características tiradas da ficha do produto
 *   descricao  – frase curta (usada no destaque 3D do topo)
 *   destaque   – true para aparecer no carrossel 3D do topo (use até 4)
 *
 *  Não coloque preço fixo: a Amazon exige preço atualizado da fonte oficial.
 * ============================================================
 */

window.CONFIG = {
  nomeLoja: "StoreNow",
  // Sua tag de associado da Amazon (Amazon Associados → "ID de rastreamento")
  tagAmazon: "alisonj12-20",
  // Link do seu grupo de ofertas (WhatsApp, Telegram, Instagram…)
  linkGrupo: "#",
};

window.CATEGORIAS = {
  anc: { nome: "Cancelamento de ruído", icone: "anc" },
  intra: { nome: "Intra-auricular", icone: "intra" },
  headphone: { nome: "Headphone", icone: "headphone" },
  esporte: { nome: "Esportivo", icone: "esporte" },
};

window.COLECOES = [
  { titulo: "Silêncio no ônibus e no metrô", categoria: "anc", cor: "#8c75ff" },
  { titulo: "Pequenos para o dia a dia", categoria: "intra", cor: "#5cffab" },
  { titulo: "Conforto para horas de uso", categoria: "headphone", cor: "#f74a8a" },
  { titulo: "Firmes no treino", categoria: "esporte", cor: "#3df2f2" },
];

window.PRODUTOS = [
  /* ---------- Cancelamento de ruído ---------- */
  {
    nome: "soundcore P30i da Anker",
    loja: "amazon",
    categoria: "anc",
    asin: "B0CRTR3PMF",
    link: "https://link.amazon/B0ihFfen0",
    imagem: "51TL2aLCIpL",
    specs: ["ANC adaptativo", "45 h", "IP54"],
    descricao: "Cancelamento de ruído adaptativo, até 45 h com o estojo e estojo que vira suporte de celular.",
    destaque: true,
  },
  {
    nome: "Samsung Galaxy Buds Core",
    loja: "amazon",
    categoria: "anc",
    asin: "B0FP8T2RDC",
    imagem: "31zLQOfTQ2L",
    specs: ["ANC", "Intérprete inteligente"],
    descricao: "Cancelamento de ruído e intérprete inteligente para conversas em outro idioma.",
    destaque: true,
  },
  {
    nome: "soundcore Q20i da Anker",
    loja: "amazon",
    categoria: "anc",
    asin: "B0C3HCD34R",
    imagem: "6196rZ67rvL",
    specs: ["ANC híbrido", "60 h", "Hi-Res"],
    descricao: "Headphone com cancelamento de ruído híbrido, áudio Hi-Res e até 60 h de bateria.",
    destaque: true,
  },
  {
    nome: "soundcore Liberty 4 NC da Anker",
    loja: "amazon",
    categoria: "anc",
    asin: "B0BZV7M23Q",
    imagem: "61f+9jTegXL",
    specs: ["ANC adaptativo", "50 h", "Hi-Res"],
  },
  /* ---------- Intra-auricular ---------- */
  {
    nome: "JBL Wave Beam 2",
    loja: "amazon",
    categoria: "intra",
    asin: "B0DHL93XCN",
    imagem: "61DFgTmj9xL",
    specs: ["Resiste a água e poeira"],
  },
  {
    nome: "JBL Wave Buds 2",
    loja: "amazon",
    categoria: "intra",
    asin: "B0DHL63KWK",
    imagem: "414+kOLlS5L",
    specs: ["Resiste a água e poeira"],
  },
  {
    nome: "soundcore P20i da Anker",
    loja: "amazon",
    categoria: "intra",
    asin: "B0BTYCRJSS",
    imagem: "61ljZu9+GXL",
    specs: ["30 h", "IPX5", "Bass Up"],
  },
  {
    nome: "Philips TAT1109",
    loja: "amazon",
    categoria: "intra",
    asin: "B0DVMQVVDY",
    imagem: "519bjoeFBTL",
    specs: ["24 h", "Microfone"],
  },
  {
    nome: "Samsung Galaxy Buds3 FE",
    loja: "amazon",
    categoria: "intra",
    asin: "B0FSGL8YCN",
    imagem: "41H9MaEFcTL",
    specs: ["Galaxy AI"],
  },
  /* ---------- Headphone ---------- */
  {
    nome: "soundcore Space 2 da Anker",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0GR4GR5QH",
    imagem: "61A6MCCa5sL",
    specs: ["ANC", "70 h", "Modo soneca"],
    descricao: "Headphone over-ear com cancelamento de ruído, até 70 h de bateria e modo soneca.",
    destaque: true,
  },
  {
    nome: "soundcore Q30 da Anker",
    loja: "amazon",
    categoria: "headphone",
    asin: "B08HMWZBXC",
    imagem: "61djooiCKWL",
    specs: ["ANC", "80 h", "LDAC"],
  },
  {
    nome: "soundcore Space One da Anker",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0C6KFZC9Z",
    imagem: "31+0vcZRBhL",
    specs: ["ANC adaptativo", "55 h", "LDAC"],
  },
  {
    nome: "soundcore Q11i da Anker",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0DJW5G283",
    imagem: "31u8GoASuSL",
    specs: ["60 h", "Hi-Res", "Multiponto"],
  },
  /* ---------- Esportivo ---------- */
  {
    nome: "soundcore Sport X20 da Anker",
    loja: "amazon",
    categoria: "esporte",
    asin: "B0CRT6HQ82",
    imagem: "316jxqwjBTL",
    specs: ["ANC adaptativo", "IP68", "48 h"],
  },
  {
    nome: "soundcore V20i da Anker",
    loja: "amazon",
    categoria: "esporte",
    asin: "B0D2XRXNGY",
    imagem: "61j3i6hFHTL",
    specs: ["Open ear", "36 h", "IP55"],
  },
  {
    nome: "soundcore AeroClip da Anker",
    loja: "amazon",
    categoria: "esporte",
    asin: "B0DLGCHL8M",
    imagem: "21yuyP+n-FL",
    specs: ["Open ear", "Clip-on", "32 h"],
  },
];
