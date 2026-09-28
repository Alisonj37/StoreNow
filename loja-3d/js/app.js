/* Interface da loja: menu, destaques, filtros e grade de produtos. */
(function () {
  "use strict";

  var CONFIG = window.CONFIG || {};
  var CATEGORIAS = window.CATEGORIAS || {};
  var COLECOES = window.COLECOES || [];
  var PRODUTOS = window.PRODUTOS || [];

  // Mesmas cores do efeito de ruído (codrops-noise-transition)
  var CORES = ["#8c75ff", "#5cffab", "#f74a8a", "#3df2f2"];
  var LOJAS = {
    amazon: { nome: "Amazon", na: "na Amazon", classe: "bolinha--amazon" },
    mercadolivre: { nome: "Mercado Livre", na: "no Mercado Livre", classe: "bolinha--ml" },
  };

  var ICONES = {
    anc: '<path d="M14 34v-4a18 18 0 0 1 36 0v4"/><rect x="10" y="32" width="10" height="18" rx="4"/><rect x="44" y="32" width="10" height="18" rx="4"/><path d="M4 36v10M60 36v10"/>',
    intra: '<path d="M22 14a12 12 0 0 1 12 12v4a8 8 0 0 1-8 8h-2v14a4 4 0 0 1-8 0V26a12 12 0 0 1 6-12z"/><circle cx="26" cy="26" r="4"/><path d="M44 24c4 3 4 13 0 16M50 20c7 5 7 19 0 24"/>',
    headphone: '<path d="M12 38v-6a20 20 0 0 1 40 0v6"/><rect x="8" y="36" width="12" height="18" rx="5"/><rect x="44" y="36" width="12" height="18" rx="5"/>',
    esporte: '<path d="M20 30a12 12 0 1 1 24 0c0 8-6 10-6 18a6 6 0 0 1-12 0"/><path d="M14 22c-4 8-2 18 6 24"/><circle cx="32" cy="30" r="4"/>',
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Link de afiliado: usa o link pronto; se não houver, monta ASIN + tag da Amazon
  function linkDe(p) {
    if (p.link) return p.link;
    if (p.loja === "amazon" && p.asin) {
      var url = "https://www.amazon.com.br/dp/" + encodeURIComponent(p.asin);
      return CONFIG.tagAmazon ? url + "?tag=" + encodeURIComponent(CONFIG.tagAmazon) : url;
    }
    return "#";
  }
  if (!CONFIG.tagAmazon && window.console) {
    console.warn("StoreNow: preencha CONFIG.tagAmazon em js/produtos.js para receber comissão da Amazon.");
  }

  function nomeCategoria(c) { return (CATEGORIAS[c] && CATEGORIAS[c].nome) || c; }
  function corCategoria(c) {
    var chaves = Object.keys(CATEGORIAS);
    var i = Math.max(0, chaves.indexOf(c));
    return CORES[i % CORES.length];
  }
  function arte(p) {
    var ic = ICONES[(CATEGORIAS[p.categoria] || {}).icone] || ICONES.headphone;
    return '<div class="arte" style="--cor:' + corCategoria(p.categoria) + '">' +
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic + "</svg></div>";
  }

  /* ---------- textos gerais ---------- */
  // Esconde o que é de uma loja sem produtos (ex.: Mercado Livre antes de cadastrar)
  Object.keys(LOJAS).forEach(function (l) {
    var tem = PRODUTOS.some(function (p) { return p.loja === l; });
    if (!tem) $$('[data-requer-loja="' + l + '"]').forEach(function (el) { el.hidden = true; });
  });
  var lojasUsadas = Object.keys(LOJAS).filter(function (l) { return PRODUTOS.some(function (p) { return p.loja === l; }); });
  if (lojasUsadas.length < 2) $("#chips-loja").hidden = true;
  if (CONFIG.nomeLoja) $$("[data-nome-loja]").forEach(function (el) { el.textContent = CONFIG.nomeLoja; });
  if (CONFIG.linkGrupo && CONFIG.linkGrupo !== "#") {
    $$("[data-link-grupo]").forEach(function (el) { el.href = CONFIG.linkGrupo; });
  }
  $("#ano").textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  var menu = $("#menu");
  var hamb = $("#hamburguer");
  function fecharMenu() {
    menu.classList.remove("aberto");
    hamb.setAttribute("aria-expanded", "false");
    hamb.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }
  hamb.addEventListener("click", function () {
    var abrir = !menu.classList.contains("aberto");
    menu.classList.toggle("aberto", abrir);
    hamb.setAttribute("aria-expanded", String(abrir));
    hamb.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = abrir ? "hidden" : "";
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", fecharMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharMenu(); });

  /* ---------- destaque do dia (carrossel ligado à cena 3D) ---------- */
  var destaques = PRODUTOS.filter(function (p) { return p.destaque; }).slice(0, 4);
  if (!destaques.length) destaques = PRODUTOS.slice(0, 4);
  var atual = 0;
  var pontos = $("#d-pontos");

  destaques.forEach(function (p, i) {
    var li = document.createElement("li");
    li.innerHTML = '<button aria-label="Ver destaque ' + (i + 1) + ": " + esc(p.nome) + '"></button>';
    li.firstChild.addEventListener("click", function () { irPara(i); });
    pontos.appendChild(li);
  });

  function pintarDestaque(anim) {
    var p = destaques[atual];
    if (!p) return;
    var loja = LOJAS[p.loja] || LOJAS.amazon;
    $("#d-loja").innerHTML = '<i class="bolinha ' + loja.classe + '"></i>' + loja.nome;
    $("#d-categoria").textContent = nomeCategoria(p.categoria);
    $("#d-titulo").textContent = p.nome;
    $("#d-desc").textContent = p.descricao || "";
    var preco = $("#d-preco");
    preco.hidden = !p.preco;
    preco.textContent = p.preco || "";
    var link = $("#d-link");
    link.href = linkDe(p);
    link.innerHTML = "Ver " + loja.na + ' <span aria-hidden="true">↗</span>';
    document.documentElement.style.setProperty("--cor-atual", CORES[atual % CORES.length]);
    $$("button", pontos).forEach(function (b, i) { b.setAttribute("aria-current", String(i === atual)); });
    if (anim) {
      var painel = $(".destaque__painel");
      painel.classList.remove("troca");
      void painel.offsetWidth;
      painel.classList.add("troca");
    }
  }

  function irPara(i) {
    if (!destaques.length) return;
    var n = (i + destaques.length) % destaques.length;
    if (n === atual) return;
    // A cena 3D só aceita uma nova transição quando a anterior terminou
    if (window.Cena3D && !window.Cena3D.transicao(CORES[n % CORES.length])) return;
    atual = n;
    pintarDestaque(true);
  }

  $("#d-prox").addEventListener("click", function () { irPara(atual + 1); });
  $("#d-ant").addEventListener("click", function () { irPara(atual - 1); });

  window.Loja = {
    cores: CORES,
    proximoDestaque: function () { irPara(atual + 1); },
  };
  pintarDestaque(false);

  /* ---------- filtros ---------- */
  var filtro = { loja: "todas", categoria: "todas", busca: "" };
  var chipsCat = $("#chips-cat");
  var cats = [["todas", "Todas as categorias"]].concat(
    Object.keys(CATEGORIAS).map(function (k) { return [k, CATEGORIAS[k].nome]; })
  );
  chipsCat.innerHTML = cats.map(function (c, i) {
    return '<button class="chip' + (i === 0 ? " ativo" : "") + '" data-categoria="' + c[0] + '">' + esc(c[1]) + "</button>";
  }).join("");

  $("#rodape-cats").innerHTML = Object.keys(CATEGORIAS).map(function (k) {
    return '<a href="#indicados" data-filtro-cat="' + k + '">' + esc(CATEGORIAS[k].nome) + "</a>";
  }).join("");

  function marcarChips() {
    $$("#chips-loja .chip").forEach(function (b) { b.classList.toggle("ativo", b.dataset.loja === filtro.loja); });
    $$("#chips-cat .chip").forEach(function (b) { b.classList.toggle("ativo", b.dataset.categoria === filtro.categoria); });
  }

  $("#chips-loja").addEventListener("click", function (e) {
    var b = e.target.closest("[data-loja]");
    if (!b) return;
    filtro.loja = b.dataset.loja;
    marcarChips(); renderGrade();
  });
  chipsCat.addEventListener("click", function (e) {
    var b = e.target.closest("[data-categoria]");
    if (!b) return;
    filtro.categoria = b.dataset.categoria;
    marcarChips(); renderGrade();
  });
  $("#busca").addEventListener("input", function (e) {
    filtro.busca = e.target.value.trim();
    renderGrade();
  });

  // Links do menu/rodapé que já aplicam um filtro
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-filtro-loja],[data-filtro-cat],[data-focar-busca]");
    if (!a) return;
    if (a.dataset.filtroLoja) { filtro.loja = a.dataset.filtroLoja; filtro.categoria = "todas"; }
    if (a.dataset.filtroCat) { filtro.categoria = a.dataset.filtroCat; filtro.loja = "todas"; }
    marcarChips(); renderGrade();
    if (a.hasAttribute("data-focar-busca")) setTimeout(function () { $("#busca").focus({ preventScroll: true }); }, 400);
  });

  function normal(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* ---------- grade ---------- */
  function cartao(p) {
    var loja = LOJAS[p.loja] || LOJAS.amazon;
    var midia = p.imagem
      ? '<img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + '" loading="lazy" />'
      : arte(p);
    return '<li class="cartao">' +
      '<a class="cartao__img" href="' + esc(linkDe(p)) + '" target="_blank" rel="nofollow sponsored noopener" aria-label="' + esc(p.nome) + " " + loja.na + '">' +
        midia + '<span class="cartao__ver">Ver oferta <span aria-hidden="true">↗</span></span>' +
      "</a>" +
      '<div class="cartao__info"><div>' +
        '<h3 class="cartao__nome"><a href="' + esc(linkDe(p)) + '" target="_blank" rel="nofollow sponsored noopener">' + esc(p.nome) + "</a></h3>" +
        '<p class="cartao__loja"><i class="bolinha ' + loja.classe + '"></i>' + loja.nome + " · " + esc(nomeCategoria(p.categoria)) + "</p>" +
        ((p.specs && p.specs.length) ? '<ul class="specs">' + p.specs.slice(0, 3).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      "</div>" + (p.preco ? '<span class="cartao__preco">' + esc(p.preco) + "</span>" : "") + "</div>" +
    "</li>";
  }

  function renderGrade() {
    var q = normal(filtro.busca);
    var lista = PRODUTOS.filter(function (p) {
      return (filtro.loja === "todas" || p.loja === filtro.loja) &&
        (filtro.categoria === "todas" || p.categoria === filtro.categoria) &&
        (!q || normal(p.nome + " " + nomeCategoria(p.categoria)).indexOf(q) !== -1);
    });
    $("#grade").innerHTML = lista.map(cartao).join("");
    $("#vazio").hidden = lista.length > 0;
    $("#contador").textContent = lista.length;
  }
  renderGrade();

  /* ---------- coleções ---------- */
  $("#lista-colecoes").innerHTML = COLECOES.map(function (c) {
    var qtd = PRODUTOS.filter(function (p) { return p.categoria === c.categoria; }).length;
    return '<a class="colecao" href="#indicados" data-filtro-cat="' + esc(c.categoria) + '" style="--cor:' + esc(c.cor) + '">' +
      '<span class="colecao__qtd">' + qtd + (qtd === 1 ? " produto" : " produtos") + "</span>" +
      '<span><span class="colecao__titulo">' + esc(c.titulo) + '</span><br /><span class="colecao__ir">Ver coleção →</span></span>' +
    "</a>";
  }).join("");
})();
