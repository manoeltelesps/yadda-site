// Tema claro e escuro. Na primeira visita segue o sistema; depois guarda a escolha.
// O toggle copia o da troca de idioma do portfólio: bolinha que desliza e que dá para arrastar.
(function () {
  "use strict";

  var root = document.documentElement;
  var sistema = matchMedia("(prefers-color-scheme: dark)");
  var reduzir = matchMedia("(prefers-reduced-motion: reduce)");
  var grupos = document.querySelectorAll(".tema");
  var CORES = { light: "#ffffff", dark: "#111113" };

  function atual() { return root.dataset.theme || (sistema.matches ? "dark" : "light"); }

  function pintar() {
    var tema = atual();
    grupos.forEach(function (g) {
      g.dataset.ativo = tema;
      g.style.removeProperty("--tema-arrasto");
      g.querySelectorAll(".tema__opcao").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.tema === tema));
      });
    });
    // Barra do navegador acompanha a escolha manual.
    document.querySelectorAll("meta[data-cor-tema]").forEach(function (m) {
      m.content = root.dataset.theme ? CORES[root.dataset.theme] : CORES[m.dataset.corTema];
    });
  }

  function escolher(tema) {
    if (tema === atual()) { pintar(); return; }
    var trocar = function () {
      root.dataset.theme = tema;
      try { localStorage.setItem("yadda-tema", tema); } catch (e) {}
      pintar();
    };
    // Troca com um fade curto quando o navegador suporta e a pessoa não pediu menos movimento.
    if (document.startViewTransition && !reduzir.matches) document.startViewTransition(trocar);
    else trocar();
  }

  grupos.forEach(function (g) {
    var bolinha = g.querySelector(".tema__bolinha");
    var arrasto = null;
    var ignorarClique = false;
    function curso() { return Math.max(0, g.clientWidth - bolinha.offsetWidth - 6); }

    g.querySelectorAll(".tema__opcao").forEach(function (b) {
      b.addEventListener("click", function () {
        if (ignorarClique) { ignorarClique = false; return; }
        escolher(b.dataset.tema);
      });
    });

    g.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.pointerType === "touch") return;
      arrasto = { id: e.pointerId, x0: e.clientX, base: atual() === "dark" ? curso() : 0, moveu: false };
    });
    g.addEventListener("pointermove", function (e) {
      if (!arrasto || arrasto.id !== e.pointerId) return;
      var delta = e.clientX - arrasto.x0;
      if (!arrasto.moveu && Math.abs(delta) < 3) return;
      if (!arrasto.moveu) { arrasto.moveu = true; g.setPointerCapture(e.pointerId); g.classList.add("tema--arrastando"); }
      var x = Math.max(0, Math.min(curso(), arrasto.base + delta));
      g.style.setProperty("--tema-arrasto", x + "px");
    });
    function soltar(e) {
      if (!arrasto || arrasto.id !== e.pointerId) return;
      var a = arrasto;
      arrasto = null;
      g.classList.remove("tema--arrastando");
      if (!a.moveu) return;
      ignorarClique = true;
      setTimeout(function () { ignorarClique = false; }, 0);
      var x = parseFloat(g.style.getPropertyValue("--tema-arrasto")) || 0;
      escolher(x >= curso() / 2 ? "dark" : "light");
      pintar();
    }
    g.addEventListener("pointerup", soltar);
    g.addEventListener("pointercancel", soltar);
  });

  sistema.addEventListener("change", function () { if (!root.dataset.theme) pintar(); });
  pintar();
})();
