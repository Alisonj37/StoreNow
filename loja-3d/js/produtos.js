/*
 * ============================================================
 *  PRODUTOS DA LOJA — edite só este arquivo
 * ============================================================
 *  Todos os produtos abaixo são EXEMPLOS. Troque por produtos reais
 *  e cole o SEU link de afiliado em "link".
 *
 *  Campos:
 *   nome       – nome que aparece no cartão
 *   loja       – "amazon" ou "mercadolivre"
 *   categoria  – uma das chaves de CATEGORIAS (abaixo)
 *   link       – seu link de afiliado (Amazon Associados / Mercado Livre Afiliados)
 *   imagem     – (opcional) URL ou caminho da foto do produto. Sem imagem,
 *                o site gera uma arte automática com o ícone da categoria.
 *   preco      – (opcional) texto do preço, ex.: "R$ 199,90". Deixe vazio
 *                se não puder manter o preço atualizado.
 *   descricao  – frase curta (usada no destaque do topo)
 *   destaque   – true para aparecer no carrossel 3D do topo (use até 4)
 * ============================================================
 */

window.CONFIG = {
  nomeLoja: "StoreNow",
  // Link do seu grupo de ofertas (WhatsApp, Telegram, Instagram…)
  linkGrupo: "#",
};

window.CATEGORIAS = {
  eletronicos: { nome: "Eletrônicos", icone: "fone" },
  casa: { nome: "Casa e Cozinha", icone: "casa" },
  beleza: { nome: "Beleza", icone: "beleza" },
  esportes: { nome: "Esportes", icone: "esporte" },
  games: { nome: "Games", icone: "game" },
  acessorios: { nome: "Acessórios", icone: "mochila" },
};

window.COLECOES = [
  { titulo: "Setup gamer completo", categoria: "games", cor: "#8c75ff" },
  { titulo: "Casa prática e bonita", categoria: "casa", cor: "#5cffab" },
  { titulo: "Rotina de cuidados", categoria: "beleza", cor: "#f74a8a" },
  { titulo: "Treino em dia", categoria: "esportes", cor: "#3df2f2" },
];

window.PRODUTOS = [
  {
    nome: "Fone de Ouvido Bluetooth com Cancelamento de Ruído",
    loja: "amazon",
    categoria: "eletronicos",
    link: "https://www.amazon.com.br/s?k=fone+bluetooth+cancelamento+de+ruido",
    imagem: "",
    preco: "",
    descricao: "Som limpo no ônibus, no trabalho e na academia.",
    destaque: true,
  },
  {
    nome: "Air Fryer Digital 4 Litros",
    loja: "mercadolivre",
    categoria: "casa",
    link: "https://lista.mercadolivre.com.br/air-fryer-digital",
    imagem: "",
    preco: "",
    descricao: "Batata crocante sem óleo em poucos minutos.",
    destaque: true,
  },
  {
    nome: "Kit Skincare Rotina Completa",
    loja: "amazon",
    categoria: "beleza",
    link: "https://www.amazon.com.br/s?k=kit+skincare",
    imagem: "",
    preco: "",
    descricao: "Limpeza, hidratação e proteção em um só kit.",
    destaque: true,
  },
  {
    nome: "Tênis de Corrida Amortecido",
    loja: "mercadolivre",
    categoria: "esportes",
    link: "https://lista.mercadolivre.com.br/tenis-de-corrida",
    imagem: "",
    preco: "",
    descricao: "Leve e confortável para treinos longos.",
    destaque: true,
  },
  {
    nome: "Controle Sem Fio para PC e Console",
    loja: "amazon",
    categoria: "games",
    link: "https://www.amazon.com.br/s?k=controle+sem+fio",
    imagem: "",
    preco: "",
  },
  {
    nome: "Smartwatch Esportivo à Prova d'Água",
    loja: "mercadolivre",
    categoria: "acessorios",
    link: "https://lista.mercadolivre.com.br/smartwatch",
    imagem: "",
    preco: "",
  },
  {
    nome: "Caixa de Som Portátil Bluetooth",
    loja: "amazon",
    categoria: "eletronicos",
    link: "https://www.amazon.com.br/s?k=caixa+de+som+bluetooth",
    imagem: "",
    preco: "",
  },
  {
    nome: "Cafeteira Expresso Compacta",
    loja: "mercadolivre",
    categoria: "casa",
    link: "https://lista.mercadolivre.com.br/cafeteira-expresso",
    imagem: "",
    preco: "",
  },
  {
    nome: "Secador de Cabelo Íon 2000W",
    loja: "amazon",
    categoria: "beleza",
    link: "https://www.amazon.com.br/s?k=secador+de+cabelo",
    imagem: "",
    preco: "",
  },
  {
    nome: "Kit Halteres Ajustáveis",
    loja: "mercadolivre",
    categoria: "esportes",
    link: "https://lista.mercadolivre.com.br/halteres-ajustaveis",
    imagem: "",
    preco: "",
  },
  {
    nome: "Teclado Mecânico RGB",
    loja: "amazon",
    categoria: "games",
    link: "https://www.amazon.com.br/s?k=teclado+mecanico",
    imagem: "",
    preco: "",
  },
  {
    nome: "Mochila para Notebook Impermeável",
    loja: "mercadolivre",
    categoria: "acessorios",
    link: "https://lista.mercadolivre.com.br/mochila-notebook",
    imagem: "",
    preco: "",
  },
];
