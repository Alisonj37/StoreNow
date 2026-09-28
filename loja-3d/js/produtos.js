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
 *   imagem     – (opcional) foto do produto. Sem imagem, o site gera uma arte.
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
  tagAmazon: "",
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
    specs: ["ANC adaptativo", "45 h", "IP54"],
    descricao: "Cancelamento de ruído adaptativo, até 45 h com o estojo e estojo que vira suporte de celular.",
    destaque: true,
  },
  {
    nome: "Samsung Galaxy Buds Core",
    loja: "amazon",
    categoria: "anc",
    asin: "B0FP8T2RDC",
    specs: ["ANC", "Intérprete inteligente"],
    descricao: "Cancelamento de ruído e intérprete inteligente para conversas em outro idioma.",
    destaque: true,
  },
  {
    nome: "soundcore Q20i da Anker",
    loja: "amazon",
    categoria: "anc",
    asin: "B0C3HCD34R",
    specs: ["ANC híbrido", "60 h", "Hi-Res"],
    descricao: "Headphone com cancelamento de ruído híbrido, áudio Hi-Res e até 60 h de bateria.",
    destaque: true,
  },
  {
    nome: "Philips TAT2500 com ANC",
    loja: "amazon",
    categoria: "anc",
    asin: "B0FVGQ8DD4",
    specs: ["ANC", "24 h", "IPX4"],
  },

  /* ---------- Intra-auricular ---------- */
  {
    nome: "JBL Wave Beam 2",
    loja: "amazon",
    categoria: "intra",
    asin: "B0DHL93XCN",
    specs: ["Resiste a água e poeira"],
  },
  {
    nome: "JBL Wave Buds 2",
    loja: "amazon",
    categoria: "intra",
    asin: "B0DHL63KWK",
    specs: ["Resiste a água e poeira"],
  },
  {
    nome: "soundcore P20i da Anker",
    loja: "amazon",
    categoria: "intra",
    asin: "B0BTYCRJSS",
    specs: ["30 h", "IPX5", "Bass Up"],
  },
  {
    nome: "Philips TAT1109",
    loja: "amazon",
    categoria: "intra",
    asin: "B0DVMQVVDY",
    specs: ["24 h", "Microfone"],
  },
  {
    nome: "Philips TAT1209",
    loja: "amazon",
    categoria: "intra",
    asin: "B0CS3RHBZQ",
    specs: ["18 h", "IPX4"],
  },

  /* ---------- Headphone ---------- */
  {
    nome: "JBL Tune 730BT",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0GR11L1VP",
    specs: ["Over-ear", "76 h"],
    descricao: "Over-ear da JBL com até 76 h de bateria para a semana inteira.",
    destaque: true,
  },
  {
    nome: "JBL Tune 530BT",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0GM1LSHQF",
    specs: ["Over-ear", "76 h"],
  },
  {
    nome: "soundcore Q11i da Anker",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0DJW5G283",
    specs: ["60 h", "Hi-Res", "Multiponto"],
  },
  {
    nome: "Philips TAH2300",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0FJMHMCBZ",
    specs: ["Over-ear", "55 h", "Dobrável"],
  },
  {
    nome: "Dapon H02d Pró ANC",
    loja: "amazon",
    categoria: "headphone",
    asin: "B0GYRTLVQ6",
    specs: ["ANC híbrido", "100 h", "Multiponto"],
  },

  /* ---------- Esportivo ---------- */
  {
    nome: "soundcore V20i da Anker",
    loja: "amazon",
    categoria: "esporte",
    asin: "B0D2XRXNGY",
    specs: ["Open ear", "36 h", "IP55"],
  },
  {
    nome: "AURAFIT Vibe 01",
    loja: "amazon",
    categoria: "esporte",
    asin: "B0HD6XVK2S",
    specs: ["Condução óssea", "Open ear"],
  },
];
