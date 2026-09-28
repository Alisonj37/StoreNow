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
    fone: '<path d="M12 36v-6a20 20 0 0 1 40 0v6"/><rect x="8" y="34" width="10" height="18" rx="4"/><rect x="46" y="34" width="10" height="18" rx="4"/>',
    casa: '<path d="M10 30 32 12l22 18"/><path d="M16 26v26h32V26"/><rect x="27" y="36" width="10" height="16"/>',
    beleza: '<rect x="20" y="24" width="24" height="30" rx="6"/><path d="M26 24v-6h12v6"/><path d="M29 18v-6h6v6"/><path d="M26 36h12"/>',
    esporte: '<path d="M8 44c0-6 4-8 10-9l10-2 6-12 8 3-2 8c6 2 12 6 16 12v4H8z"/><path d="M8 48h48"/><path d="M26 34l4 4M32 32l4 4"/>',
    game: '<path d="M18 22h28a10 10 0 0 1 10 10l2 12a6 6 0 0 1-11 4l-5-6H22l-5 6a6 6 0 0 1-11-4l2-12a10 10 0 0 1 10-10z"/><path d="M20 30v8M16 34h8"/><circle cx="42" cy="31" r="1.5"/><circle cx="46" cy="36" r="1.5"/>',
    mochila: '<path d="M18 26a14 14 0 0 1 28 0v26a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z"/><path d="M26 12h12v6"/><rect x="24" y="34" width="16" height="10" rx="2"/>',
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function nomeCategoria(c) { return (CATEGORIAS[c] && CATEGORIAS[c].nome) || c; }
  function corCategoria(c) {
    var chaves = Object.keys(CATEGORIAS);
    var i = Math.max(0, chaves.indexOf(c));
    return CORES[i % CORES.length];
  }
  function arte(p) {
    var ic = ICONES[(CATEGORIAS[p.categoria] || {}).icone] || ICONES.mochila;
    return '<div class="arte" style="--cor:' + corCategoria(p.categoria) + '">' +
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic + "</svg></div>";
  }

  /* ---------- textos gerais ---------- */
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
    link.href = p.link || "#";
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
      '<a class="cartao__img" href="' + esc(p.link || "#") + '" target="_blank" rel="nofollow sponsored noopener" aria-label="' + esc(p.nome) + " " + loja.na + '">' +
        midia + '<span class="cartao__ver">Ver oferta <span aria-hidden="true">↗</span></span>' +
      "</a>" +
      '<div class="cartao__info"><div>' +
        '<h3 class="cartao__nome"><a href="' + esc(p.link || "#") + '" target="_blank" rel="nofollow sponsored noopener">' + esc(p.nome) + "</a></h3>" +
        '<p class="cartao__loja"><i class="bolinha ' + loja.classe + '"></i>' + loja.nome + " · " + esc(nomeCategoria(p.categoria)) + "</p>" +
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
