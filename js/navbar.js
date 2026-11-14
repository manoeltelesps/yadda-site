// Navbar no padrão do portfólio do Marcos: larga e sem vidro no topo, vira cápsula de vidro
// ao descer e volta a ficar larga ao subir perto do topo. No celular, abre um painel pelo chevron.
(function () {
  "use strict";

  var cena = document.querySelector(".nav-cena");
  if (!cena) return;
  var botao = cena.querySelector(".nav__menu");
  var painel = cena.querySelector(".nav-painel");
  var itens = painel ? painel.querySelectorAll("[data-item]") : [];
  var reduzir = matchMedia("(prefers-reduced-motion: reduce)");
  var largo = matchMedia("(min-width: 601px)");
  var M = window.Motion;
  var ease = [0.22, 1, 0.36, 1];

  // Largo no topo. Descendo, vira cápsula com um pouco de rolagem. Subindo, volta ao largo perto do topo.
  var ultimoY = window.scrollY;
  function aoRolar() {
    var y = window.scrollY;
    var descendo = y > ultimoY;
    var subindo = y < ultimoY;
    ultimoY = y;
    if (y <= 8) cena.dataset.largo = "true";
    else if (descendo && y > 32) cena.dataset.largo = "false";
    else if (subindo && y < 300) cena.dataset.largo = "true";
  }
  cena.dataset.largo = window.scrollY <= 32 ? "true" : "false";
  window.addEventListener("scroll", aoRolar, { passive: true });

  if (!botao || !painel) return;

  var aberto = false;
  function abrir() {
    aberto = true;
    painel.hidden = false;
    botao.setAttribute("aria-expanded", "true");
    botao.setAttribute("aria-label", "Fechar menu");
    if (M && !reduzir.matches) {
      M.animate(painel, { opacity: [0, 1], y: [-12, 0], scaleY: [0.92, 1] }, { duration: 0.34, ease: ease });
      M.animate(itens, { opacity: [0, 1], y: [10, 0] }, { duration: 0.36, ease: ease, delay: M.stagger(0.06, { startDelay: 0.1 }) });
    }
  }
  function fechar(devolverFoco) {
    if (!aberto) return;
    aberto = false;
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu");
    if (devolverFoco) botao.focus();
    if (M && !reduzir.matches) {
      M.animate(painel, { opacity: 0, y: -8, scaleY: 0.96 }, { duration: 0.18, ease: ease })
        .then(function () { if (!aberto) painel.hidden = true; });
    } else {
      painel.hidden = true;
    }
  }

  botao.addEventListener("click", function () { aberto ? fechar(false) : abrir(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(true); });
  document.addEventListener("pointerdown", function (e) {
    if (aberto && !e.target.closest(".nav, .nav-painel")) fechar(false);
  });
  largo.addEventListener("change", function () { if (largo.matches) fechar(false); });
  itens.forEach(function (item) { item.addEventListener("click", function () { fechar(false); }); });
})();
