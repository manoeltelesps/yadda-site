// iPad 3D da página inicial (three.js).
// Um único iPad sai da abertura mostrando a prancha e, conforme a página rola,
// desce girando até a seção do Modo Escuta, onde a tela troca para a Escuta.
// As molduras em CSS continuam na página como reserva e servem de âncora de posição.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Box3, Vector3,
  TextureLoader, SRGBColorSpace, MeshBasicMaterial, PMREMGenerator, ACESFilmicToneMapping,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const root = document.documentElement;
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ancoraA = document.querySelector("[data-ipad='prancha']");
const ancoraB = document.querySelector("[data-ipad='escuta']");
// Celular e tablet sem mouse: menos pixels, texturas menores e sem antialias em tela de alta densidade.
const leve = matchMedia("(hover: none), (max-width: 900px)").matches;
const dpr = window.devicePixelRatio || 1;

function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
}

if (!reduz && ancoraA && ancoraB && temWebGL()) iniciar().catch(() => root.classList.remove("tres"));

async function iniciar() {
  const canvas = document.createElement("canvas");
  canvas.className = "cena3d";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const renderer = new WebGLRenderer({ canvas, antialias: !leve || dpr < 2, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(dpr, leve ? 1.5 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const cena = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.9;

  const fov = 30;
  const camera = new PerspectiveCamera(fov, 1, 1, 5000);
  const distancia = 1000;
  camera.position.set(0, 0, distancia);

  const carregaTextura = (url) => new Promise((ok, erro) => new TextureLoader().load(url, (t) => {
    t.colorSpace = SRGBColorSpace;
    t.flipY = false;
    t.center.set(0.5, 0.5);
    t.rotation = -Math.PI / 2;
    t.repeat.set(-1, 1);
    t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), leve ? 4 : 16);
    ok(t);
  }, undefined, erro));

  const [gltf, texPrancha, texEscuta] = await Promise.all([
    new GLTFLoader().loadAsync("img/ipad.glb"),
    carregaTextura(leve ? "img/prancha-1024.jpg" : "img/prancha.jpg"),
    carregaTextura(leve ? "img/escuta-1024.jpg" : "img/escuta.jpg"),
  ]);

  // Centraliza o modelo e deita o iPad (o original vem de pé).
  const modelo = gltf.scene;
  const caixa = new Box3().setFromObject(modelo);
  const centro = caixa.getCenter(new Vector3());
  modelo.position.sub(centro);
  const tamanho = caixa.getSize(new Vector3());
  const deitado = new Group();
  deitado.add(modelo);
  deitado.rotation.z = Math.PI / 2;
  const larguraModelo = tamanho.y; // depois de deitar, a altura vira largura

  // A tela mistura a prancha e a Escuta, para a troca ser um esmaecer suave.
  const troca = { value: 0 };
  const tela = new MeshBasicMaterial({ map: texPrancha, toneMapped: false });
  tela.onBeforeCompile = (shader) => {
    shader.uniforms.mapaEscuta = { value: texEscuta };
    shader.uniforms.troca = troca;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D mapaEscuta;\nuniform float troca;")
      .replace("#include <map_fragment>",
        "vec4 sampledDiffuseColor = mix(texture2D(map, vMapUv), texture2D(mapaEscuta, vMapUv), troca);\ndiffuseColor *= sampledDiffuseColor;");
  };
  modelo.traverse((o) => {
    if (o.isMesh && o.material && o.material.name === "screen") o.material = tela;
  });

  const ipad = new Group();
  ipad.add(deitado);
  cena.add(ipad);

  // Estado animado pela Motion (entrada) e pelo ponteiro (inclinação).
  const estado = { entrada: 0, mx: 0, my: 0, progresso: 0 };
  const alvo = { mx: 0, my: 0 };

  // O canvas tem a altura da tela com a barra do Safari recolhida (100lvh), então a barra
  // aparecer ou sumir não muda o tamanho e não refaz os buffers no meio da rolagem.
  let larguraCanvas = 0, alturaCanvas = 0;
  function tamanhoTela() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === larguraCanvas && h === alturaCanvas) return;
    larguraCanvas = w; alturaCanvas = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  tamanhoTela();

  // Só desenha quando algo muda: rolagem, ponteiro, tamanho ou animação em curso.
  // Parado, o último quadro fica na tela e a GPU descansa.
  let rodando = false;
  function acordar() {
    if (rodando) return;
    rodando = true;
    estado.ultimo = performance.now();
    requestAnimationFrame(quadro);
  }
  window.addEventListener("scroll", acordar, { passive: true });
  window.addEventListener("resize", () => { tamanhoTela(); acordar(); });
  window.addEventListener("load", acordar);
  if ("ResizeObserver" in window) new ResizeObserver(acordar).observe(document.body);

  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      alvo.mx = e.clientX / window.innerWidth - 0.5;
      alvo.my = e.clientY / window.innerHeight - 0.5;
      acordar();
    });
  }

  const suaviza = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mistura = (a, b, t) => a + (b - a) * t;
  const retangulo = (el) => el.getBoundingClientRect();

  function quadro() {
    const h = alturaCanvas;
    const ra = retangulo(ancoraA), rb = retangulo(ancoraB);

    // Progresso: 0 com a abertura no centro da tela, 1 quando o Modo Escuta chega a 70% da altura,
    // para o iPad assentar antes de o texto da seção ficar à vista.
    // É amortecido para o iPad acompanhar a rolagem sem trancos.
    const ca = ra.top + ra.height / 2, cb = rb.top + rb.height / 2;
    const bruto = Math.min(1, Math.max(0, (h / 2 - ca) / (cb - ca - 0.2 * h)));
    // Amortecimento que não depende da taxa de quadros.
    const agora = performance.now();
    const dt = Math.min(0.05, (agora - (estado.ultimo || agora)) / 1000);
    estado.ultimo = agora;
    estado.progresso += (bruto - estado.progresso) * (1 - Math.exp(-dt * 6));
    const p = estado.progresso;
    const t = suaviza(0, 1, p);
    const arco = Math.sin(Math.PI * t);

    const cx = mistura(ra.left + ra.width / 2, rb.left + rb.width / 2, t);
    const cy = mistura(ca, cb, t);
    const largura = mistura(ra.width, rb.width, t) * mistura(1, 0.94, arco);

    // Converte pixels da tela para unidades da cena no plano z = 0.
    const alturaVisivel = 2 * distancia * Math.tan((fov * Math.PI) / 360);
    const px = alturaVisivel / h;
    ipad.position.set((cx - larguraCanvas / 2) * px, -(cy - h / 2) * px, 0);
    const escala = (largura * px) / larguraModelo;

    // Entrada: sobe pouco e se assenta.
    const e = estado.entrada;
    ipad.scale.setScalar(escala * mistura(0.96, 1, e));
    ipad.position.y -= (1 - e) * 40 * px;

    // Um giro completo e lento durante a viagem; a tela esmaece para a Escuta enquanto o iPad está de costas.
    const giro = suaviza(0.1, 0.9, p) * Math.PI * 2;
    troca.value = suaviza(0.4, 0.6, p);

    const k = 1 - Math.exp(-dt * 4);
    estado.mx += (alvo.mx - estado.mx) * k;
    estado.my += (alvo.my - estado.my) * k;

    ipad.rotation.y = giro + estado.mx * 0.12;
    ipad.rotation.x = (1 - e) * 0.18 + arco * 0.08 + estado.my * 0.06;
    ipad.rotation.z = 0;

    // Fora da tela não desenha: esconde o canvas para não sobrar o último quadro.
    const visivel = cy + largura > 0 && cy - largura < h;
    canvas.style.visibility = visivel ? "" : "hidden";
    if (visivel) renderer.render(cena, camera);

    const assentado = Math.abs(bruto - estado.progresso) < 0.0005 && e >= 1 &&
      Math.abs(alvo.mx - estado.mx) < 0.001 && Math.abs(alvo.my - estado.my) < 0.001;
    if (assentado) { rodando = false; return; }
    requestAnimationFrame(quadro);
  }

  root.classList.add("tres");
  acordar();

  const M = window.Motion;
  if (M) {
    M.animate(canvas, { opacity: [0, 1] }, { duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.3 });
    M.animate(estado, { entrada: [0, 1] }, { duration: 0.8, ease: [0.2, 0, 0, 1], delay: 0.3 }).then(acordar);
  } else {
    estado.entrada = 1;
  }
}
