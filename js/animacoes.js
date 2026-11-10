// Animações do site do YADDA com a biblioteca Motion (motion.dev).
// Só transform e opacity. Quem pede menos movimento no sistema não vê nada disso.
(function () {
  "use strict";

  var root = document.documentElement;

  // Cards da frase: tocar fala a palavra com a voz do navegador, no próprio aparelho.
  function falar(texto) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    var fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    window.speechSynthesis.speak(fala);
  }
  document.querySelectorAll("[data-palavra]").forEach(function (botao) {
    botao.addEventListener("click", function () { falar(botao.dataset.palavra); });
  });

  var M = window.Motion;
  if (!root.classList.contains("anima")) return;
  if (!M) { root.classList.remove("anima"); return; }

  // Rolagem suave com o Lenis (só mouse e trackpad; no toque fica a rolagem nativa).
  if (window.Lenis) {
    try {
      window.rolagem = new window.Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9, anchors: true });
    } catch (e) {}
  }

  try {
    var animate = M.animate, stagger = M.stagger, inView = M.inView,
        hover = M.hover, press = M.press, scroll = M.scroll;

    var mola = { type: "spring", bounce: 0.3, visualDuration: 0.3 };
    var molaFirme = { type: "spring", bounce: 0.15, visualDuration: 0.25 };
    var suave = { duration: 0.3, ease: [0.2, 0, 0, 1] };

    // Quebra o título em palavras para a cascata.
    document.querySelectorAll("[data-palavras]").forEach(function (titulo) {
      var palavras = titulo.textContent.trim().split(/\s+/);
      titulo.setAttribute("aria-label", palavras.join(" "));
      titulo.textContent = "";
      palavras.forEach(function (p, i) {
        var span = document.createElement("span");
        span.className = "palavra";
        span.setAttribute("aria-hidden", "true");
        span.textContent = p;
        titulo.appendChild(span);
        if (i < palavras.length - 1) titulo.appendChild(document.createTextNode(" "));
      });
    });

    // Entrada em cascata, na ordem em que os elementos aparecem na página.
    var entrada = document.querySelectorAll("[data-entra], .palavra");
    entrada.forEach(function (el, i) {
      var atraso = Math.min(i * 0.06, 0.9);
      if (el.matches(".frase button")) {
        animate(el, { opacity: [0, 1], y: [32, 0], rotate: [-10, 0], scale: [0.7, 1] },
          { type: "spring", bounce: 0.45, visualDuration: 0.3, delay: atraso });
      } else if (el.matches(".palco")) {
        animate(el, { opacity: [0, 1], y: [64, 0], scale: [0.92, 1], rotateX: [14, 0] },
          { type: "spring", bounce: 0.2, visualDuration: 0.3, delay: atraso + 0.1 });
      } else if (el.matches(".palavra")) {
        animate(el, { opacity: [0, 1], y: [20, 0] }, Object.assign({}, mola, { delay: atraso }));
      } else {
        animate(el, { opacity: [0, 1], y: [12, 0] }, Object.assign({}, suave, { delay: atraso }));
      }
    });

    // Garantia: se o navegador pausar a animação, o topo aparece mesmo assim.
    setTimeout(function () {
      entrada.forEach(function (el) {
        if (getComputedStyle(el).opacity === "0") { el.style.opacity = "1"; el.style.transform = "none"; }
      });
    }, 3000);

    // Revela ao rolar.
    document.querySelectorAll("[data-revela]").forEach(function (el) {
      inView(el, function () {
        animate(el, { opacity: [0, 1], y: [32, 0], scale: [0.98, 1] }, mola);
      }, { amount: 0.25 });
    });
    document.querySelectorAll("[data-cascata]").forEach(function (grupo) {
      var itens = grupo.querySelectorAll(":scope > *, :scope > ul > li");
      inView(grupo, function () {
        animate(itens, { opacity: [0, 1], y: [24, 0] },
          Object.assign({}, mola, { delay: stagger(0.07) }));
      }, { amount: 0.2 });
    });

    // Barra de progresso da leitura.
    var barra = document.querySelector(".progresso");
    if (barra) {
      scroll(animate(barra, { scaleX: [0, 1] }, { ease: "linear" }));
      var ajustaBarra = function () {
        barra.style.visibility = root.scrollHeight - window.innerHeight > 80 ? "visible" : "hidden";
      };
      ajustaBarra();
      window.addEventListener("resize", ajustaBarra);
    }

    // Botões e links de menu: crescem no hover e afundam no toque.
    hover(".botao, .menu a, .marca", function (el) {
      animate(el, { scale: 1.04 }, molaFirme);
      return function () { animate(el, { scale: 1 }, molaFirme); };
    });
    press(".botao, .menu a, .marca, .perguntas summary", function (el) {
      animate(el, { scale: 0.95 }, molaFirme);
      return function () { animate(el, { scale: 1 }, mola); };
    });

    // Cards da frase: levantam no hover, afundam no toque e dão um pulinho ao falar.
    hover(".frase button", function (el) {
      animate(el, { y: -6, rotate: el.matches(":nth-child(2)") ? 2 : -2 }, mola);
      return function () { animate(el, { y: 0, rotate: 0 }, mola); };
    });
    press(".frase button", function (el) {
      animate(el, { scale: 0.88 }, molaFirme);
      return function () {
        animate(el, { scale: [1.12, 1] }, { type: "spring", bounce: 0.5, visualDuration: 0.3 });
      };
    });

    // iPad da abertura inclina seguindo o ponteiro (só com mouse ou trackpad).
    var palco = document.querySelector(".palco");
    var ipad = palco && palco.querySelector("[data-inclina]");
    if (ipad && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      palco.addEventListener("pointermove", function (e) {
        if (root.classList.contains("tres")) return;
        var r = palco.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        animate(ipad, { rotateY: x * 8, rotateX: y * -6, scale: 1.01 }, molaFirme);
      });
      palco.addEventListener("pointerleave", function () {
        animate(ipad, { rotateY: 0, rotateX: 0, scale: 1 }, mola);
      });
    }

    // Perguntas frequentes: a resposta entra deslizando ao abrir.
    document.querySelectorAll(".perguntas details").forEach(function (det) {
      det.addEventListener("toggle", function () {
        if (!det.open) return;
        var resposta = det.querySelector(".resposta");
        if (resposta) animate(resposta, { opacity: [0, 1], y: [-8, 0] }, suave);
      });
    });
  } catch (erro) {
    root.classList.remove("anima");
  }
})();
