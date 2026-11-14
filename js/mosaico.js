// Mosaico de cards do app no fundo da hero.
// Cada fileira é uma faixa que repete na horizontal, dentro de um plano inclinado.
// Fileiras alternadas andam em sentidos opostos, exatamente uma volta do padrão, então o loop não tem salto.
(function () {
  "use strict";

  var plano = document.querySelector(".mosaico__plano");
  if (!plano) return;

  // Cor de cada palavra segue a classe gramatical, como nos cards do app.
  var CARDS = [
    ["eu", "eu", "yellow"], ["ver", "ver", "green"], ["como", "como", "purple"], ["frio", "frio", "blue"],
    ["quem", "quem", "purple"], ["la", "lá", "blue"], ["comer", "comer", "green"], ["aquilo", "aquilo", "yellow"],
    ["mesa", "mesa", "orange"], ["falar", "falar", "green"], ["carro", "carro", "orange"], ["legal", "legal", "pink"],
    ["jogar", "jogar", "green"], ["casa", "casa", "orange"], ["onde", "onde", "purple"], ["beber", "beber", "green"],
    ["antes", "antes", "blue"], ["quente", "quente", "blue"], ["cafe", "café", "orange"], ["isto", "isto", "yellow"],
    ["nao", "não", "pink"], ["remedio", "remédio", "orange"], ["bonito", "bonito", "blue"], ["querer", "querer", "green"],
    ["desculpa", "desculpa", "pink"], ["celular", "celular", "orange"], ["quando", "quando", "purple"], ["sua", "sua", "yellow"],
    ["depois", "depois", "blue"], ["dizer", "dizer", "green"], ["bom-dia", "bom dia", "pink"], ["banheiro", "banheiro", "orange"],
    ["mais", "mais", "blue"], ["agua", "água", "orange"], ["leite", "leite", "orange"], ["por-favor", "por favor", "pink"]
  ];
  var COLUNAS = 9, LINHAS = 4;
  var CARD = 120, VAO = 20, PASSO = CARD + VAO, RAIO = 26;
  var W = COLUNAS * PASSO;
  var escala = Math.min(window.devicePixelRatio || 1, 2);

  var css = getComputedStyle(document.documentElement);
  function cor(nome) { return css.getPropertyValue("--" + nome + "-500").trim(); }
  // Mistura a cor com branco (0 a 1) para o topo do degradê do card.
  function clarear(hex, t) {
    var n = parseInt(hex.replace("#", ""), 16);
    var r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return "rgb(" + [r, g, b].map(function (v) { return Math.round(v + (255 - v) * t); }).join(",") + ")";
  }

  function carregar(nome) {
    return new Promise(function (ok) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { ok(null); };
      img.src = "img/cards/" + nome + ".png";
    });
  }

  function cardEm(ctx, x, y, dados, img) {
    var base = cor(dados[2]);
    var grad = ctx.createLinearGradient(0, y, 0, y + CARD);
    grad.addColorStop(0, clarear(base, 0.3));
    grad.addColorStop(1, base);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, CARD, CARD, RAIO);
    ctx.fill();
    if (img) ctx.drawImage(img, x + (CARD - 56) / 2, y + 16, 56, 56);
    ctx.fillStyle = "#1c1c1e";
    ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(dados[1], x + CARD / 2, y + CARD - 18);
  }

  // Uma imagem por fileira (W x PASSO), repetida na horizontal. Cada fileira anda num sentido.
  Promise.all(CARDS.map(function (c) { return carregar(c[0]); })).then(function (imgs) {
    var urls = [];
    var pendentes = LINHAS;
    for (var l = 0; l < LINHAS; l++) (function (l) {
      var canvas = document.createElement("canvas");
      canvas.width = W * escala;
      canvas.height = PASSO * escala;
      var ctx = canvas.getContext("2d");
      if (!ctx || !ctx.roundRect) return;
      ctx.scale(escala, escala);
      for (var c = 0; c < COLUNAS; c++) {
        var i = l * COLUNAS + c;
        cardEm(ctx, c * PASSO + VAO / 2, VAO / 2, CARDS[i], imgs[i]);
      }
      canvas.toBlob(function (blob) {
        if (blob) urls[l] = URL.createObjectURL(blob);
        if (--pendentes === 0) montar(urls);
      });
    })(l);
  });

  // Só as fileiras e a largura que cobrem a hero inclinada. Antes eram 300vw e a altura da tela vezes 3,
  // o que no celular virava cerca de 20 camadas enormes animando ao mesmo tempo.
  var ANGULO = 12 * Math.PI / 180;
  var urlsProntas = null, filas = 0;
  function medidas() {
    var r = plano.parentElement.getBoundingClientRect();
    var w = Math.max(r.width, window.innerWidth), h = Math.max(r.height, 1);
    return {
      largura: Math.ceil(w * Math.cos(ANGULO) + h * Math.sin(ANGULO)) + PASSO * 2,
      filas: Math.ceil((w * Math.sin(ANGULO) + h * Math.cos(ANGULO)) / PASSO) + 2
    };
  }
  function ajustar() {
    if (!urlsProntas) return;
    var m = medidas();
    plano.style.width = m.largura + "px";
    plano.style.marginLeft = -m.largura / 2 + "px";
    var frag = document.createDocumentFragment();
    for (; filas < m.filas; filas++) {
      var fila = document.createElement("div");
      fila.className = "mosaico__fila " + (filas % 2 ? "mosaico__fila--dir" : "mosaico__fila--esq");
      fila.style.backgroundImage = "url(" + urlsProntas[filas % LINHAS] + ")";
      // Fileiras ímpares deslocadas meio card, como tijolo.
      fila.style.backgroundPositionX = (filas % 2) * (PASSO / 2) + "px";
      frag.appendChild(fila);
    }
    plano.appendChild(frag);
  }

  function montar(urls) {
    urlsProntas = urls;
    plano.style.setProperty("--mosaico-w", W + "px");
    plano.style.setProperty("--mosaico-fila", PASSO + "px");
    ajustar();
    plano.classList.add("anda");
    var larguraAntes = window.innerWidth;
    window.addEventListener("resize", function () {
      // A barra do Safari muda só a altura; aí não precisa refazer nada.
      if (window.innerWidth === larguraAntes) return;
      larguraAntes = window.innerWidth;
      ajustar();
    });
  }
})();
