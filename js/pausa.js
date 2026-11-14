// Animações em loop param quando saem da tela, para não gastar bateria nem travar a rolagem no celular.
(function () {
  "use strict";
  var alvos = document.querySelectorAll("[data-pausa-fora]");
  if (!alvos.length || !("IntersectionObserver" in window)) return;
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) { e.target.classList.toggle("fora-da-tela", !e.isIntersecting); });
  }, { rootMargin: "100px 0px" });
  alvos.forEach(function (el) { obs.observe(el); });
})();
