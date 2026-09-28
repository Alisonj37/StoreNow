/*
 * Cena 3D do destaque — adaptação em Three.js puro do projeto
 * codrops-noise-transition (MIT): fundo com anel de ruído radial
 * e um cartão 3D com a foto do produto. A troca entre produtos usa a
 * mesma emenda com ruído que o original aplica na textura da lata.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { ruido } from "./ruido.js";

const canvas = document.getElementById("cena");
const palco = document.getElementById("palco");
const cores = (window.Loja && window.Loja.cores) || ["#8c75ff", "#5cffab", "#f74a8a", "#3df2f2"];
const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  canvas.remove(); // sem WebGL: fica o fundo em gradiente do CSS
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0, 16);

const pmrem = new THREE.PMREMGenerator(renderer);
cena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
cena.add(new THREE.AmbientLight(0xffffff, 0.5));

/* ---------------- animação simples (substitui framer-motion) ---------------- */
const easeQuadOut = (t) => t * (2 - t);
function animar(de, ate, duracao, aoAtualizar, aoTerminar) {
  const inicio = performance.now();
  function passo(agora) {
    const t = Math.min(1, (agora - inicio) / (duracao * 1000));
    aoAtualizar(de + (ate - de) * easeQuadOut(t));
    if (t < 1) requestAnimationFrame(passo);
    else if (aoTerminar) aoTerminar();
  }
  requestAnimationFrame(passo);
}

/* ---------------- fundo: anel de ruído radial ---------------- */
const fundoMat = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0 },
    u_progress: { value: 0 },
    u_aspect: { value: 1 },
    u_color: { value: new THREE.Color(cores[0]) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float u_time;
    uniform float u_progress;
    uniform float u_aspect;
    uniform vec3 u_color;
    varying vec2 vUv;
    #define PI 3.14159265
    ${ruido}
    void main() {
      vec2 newUv = (vUv - vec2(0.5)) * vec2(u_aspect, 1.);
      float dist = length(newUv);
      float density = 1.8 - dist;
      float noise = cnoise(vec4(newUv * 40. * density, u_time, 1.));
      float grain = (fract(sin(dot(vUv, vec2(12.9898, 78.233) * 2000.0)) * 43758.5453));

      float facets = noise * 2.;
      float dots = smoothstep(0.1, 0.15, noise);
      float n = step(.2, facets) * dots;
      n = 1. - n;

      float radius = 1.5;
      float outerProgress = clamp(1.1 * u_progress, 0., 1.);
      float innerProgress = clamp(1.1 * u_progress - 0.05, 0., 1.);
      float innerCircle = 1. - smoothstep((innerProgress - 0.4) * radius, innerProgress * radius, dist);
      float outerCircle = 1. - smoothstep((outerProgress - 0.1) * radius, innerProgress * radius, dist);
      float displacement = outerCircle - innerCircle;

      float grainStrength = 0.3;
      vec3 final = vec3(displacement - (n + noise)) - vec3(grain * grainStrength);
      gl_FragColor = vec4(final, 1.0);
      gl_FragColor.rgb *= u_color * 2.;
      #include <colorspace_fragment>
    }
  `,
});
const fundo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fundoMat);
cena.add(fundo);

function pulsoFundo(cor) {
  fundoMat.uniforms.u_color.value.set(cor);
  animar(0, 1, 2, (v) => (fundoMat.uniforms.u_progress.value = v));
}
pulsoFundo(cores[0]);

/* ---------------- cartão 3D com a foto do produto ---------------- */
const destaques = (window.Loja && window.Loja.destaques) || [];
const LADO = 4.6; // tamanho do cartão em unidades da cena

const suporte = new THREE.Group(); // recebe o arraste (como PresentationControls)
const flutua = new THREE.Group(); // sobe e desce
suporte.add(flutua);
cena.add(suporte);

const cartao = new THREE.Group();
cartao.position.set(0, 0, 4);
cartao.rotation.set(0.08, -0.32, 0);
flutua.add(cartao);

const corpo = new THREE.Mesh(
  new RoundedBoxGeometry(LADO, LADO, 0.3, 6, 0.32),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.05 })
);
cartao.add(corpo);

// Frente do cartão: mistura a foto atual e a próxima com uma emenda de ruído
const fotoMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    u_tex1: { value: null },
    u_tex2: { value: null },
    u_progress: { value: 0 },
    u_time: { value: 0 },
    u_cor: { value: new THREE.Color(cores[0]) },
    u_raio: { value: 0.07 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D u_tex1;
    uniform sampler2D u_tex2;
    uniform float u_progress;
    uniform float u_time;
    uniform float u_raio;
    uniform vec3 u_cor;
    varying vec2 vUv;
    ${ruido}
    void main() {
      // cantos arredondados, iguais aos do cartão
      vec2 q = abs(vUv - 0.5) - (0.5 - u_raio);
      float d = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - u_raio;
      float alpha = 1. - smoothstep(-0.002, 0.002, d);

      // emenda com ruído que sobe de baixo para cima
      float n = cnoise(vec4(vUv * 5., u_time * 0.2, 0.));
      float frente = mix(-0.3, 1.3, u_progress);
      float v = vUv.y + n * 0.12;
      float mascara = 1. - smoothstep(frente - 0.01, frente + 0.01, v);
      float ativa = step(0.001, u_progress) * step(u_progress, 0.999);
      float borda = (1. - smoothstep(0., 0.07, abs(v - frente))) * ativa;

      vec3 c1 = texture2D(u_tex1, vUv).rgb;
      vec3 c2 = texture2D(u_tex2, vUv).rgb;
      vec3 cor = mix(c1, c2, mascara);
      float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233) * 2000.0)) * 43758.5453);
      cor = mix(cor, u_cor * (0.75 + 0.5 * grain), borda);

      gl_FragColor = vec4(cor, alpha);
      #include <colorspace_fragment>
    }
  `,
});
const frente = new THREE.Mesh(new THREE.PlaneGeometry(LADO, LADO), fotoMat);
frente.position.z = 0.151;
cartao.add(frente);

/* Texturas: cada destaque começa com uma arte (nome + cor) e troca pela
   foto assim que ela carrega. Se o servidor da foto não liberar o uso em
   WebGL (CORS), a foto aparece num cartão HTML com a mesma rotação. */
const TAM = 1024;
let modoHTML = false;
const cartaoHTML = document.getElementById("cartao3d");
const fotoHTML = cartaoHTML ? cartaoHTML.querySelector("img") : null;

function quebrarTexto(ctx, texto, largura) {
  const linhas = [];
  let linha = "";
  for (const palavra of texto.split(" ")) {
    const teste = linha ? linha + " " + palavra : palavra;
    if (ctx.measureText(teste).width > largura && linha) {
      linhas.push(linha);
      linha = palavra;
    } else linha = teste;
  }
  if (linha) linhas.push(linha);
  return linhas;
}

function desenharArte(ctx, d) {
  const g = ctx.createRadialGradient(TAM * 0.3, TAM * 0.25, 0, TAM * 0.5, TAM * 0.5, TAM * 0.8);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, d.cor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TAM, TAM);
  ctx.fillStyle = "#0e0e10";
  ctx.font = '600 44px "Inter Tight", Arial, sans-serif';
  ctx.fillText(d.categoria || "", 80, 130);
  ctx.font = '700 104px "Inter Tight", Arial, sans-serif';
  const linhas = quebrarTexto(ctx, d.nome, TAM - 160).slice(0, 5);
  linhas.forEach((l, i) => ctx.fillText(l, 80, TAM - 90 - (linhas.length - 1 - i) * 112));
}

function desenharFoto(ctx, img) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, TAM, TAM);
  const margem = TAM * 0.1;
  const caixa = TAM - margem * 2;
  const k = Math.min(caixa / img.naturalWidth, caixa / img.naturalHeight);
  const w = img.naturalWidth * k;
  const h = img.naturalHeight * k;
  ctx.drawImage(img, (TAM - w) / 2, (TAM - h) / 2, w, h);
}

function carregarImagem(url, cors) {
  return new Promise((ok, erro) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => ok(img);
    img.onerror = erro;
    img.src = url;
  });
}

function ativarModoHTML() {
  if (modoHTML || !cartaoHTML) return;
  modoHTML = true;
  cartao.visible = false;
  cartaoHTML.hidden = false;
  fotoHTML.src = destaques[atual] ? destaques[atual].foto : "";
}

const texturas = destaques.map((d) => {
  const c = document.createElement("canvas");
  c.width = c.height = TAM;
  const ctx = c.getContext("2d");
  desenharArte(ctx, d);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (d.foto) {
    carregarImagem(d.foto, true)
      .then((img) => {
        tex.userData.temFoto = true;
        desenharFoto(ctx, img);
        tex.needsUpdate = true;
      })
      .catch(() =>
        // a foto abre sem CORS? então o bloqueio é só no WebGL: usa o cartão HTML
        carregarImagem(d.foto, false).then(ativarModoHTML, () => {})
      );
  }
  if (document.fonts) {
    // redesenha a arte com a fonte certa, se a foto ainda não chegou
    document.fonts.ready.then(() => {
      if (tex.userData.temFoto) return;
      desenharArte(ctx, d);
      tex.needsUpdate = true;
    });
  }
  return tex;
});

let atual = 0;
fotoMat.uniforms.u_tex1.value = texturas[0] || null;
fotoMat.uniforms.u_tex2.value = texturas[0] || null;
let tocando = false;

/* Troca para o destaque n: foto com emenda de ruído + anel no fundo.
   Retorna false se uma troca ainda está acontecendo. */
function transicao(n) {
  if (tocando || !texturas[n]) return false;
  const cor = destaques[n].cor;
  pulsoFundo(cor);
  tocando = true;
  atual = n;
  fotoMat.uniforms.u_tex2.value = texturas[n];
  fotoMat.uniforms.u_cor.value.set(cor);
  if (modoHTML) {
    fotoHTML.style.opacity = "0";
    setTimeout(() => {
      fotoHTML.src = destaques[n].foto;
      fotoHTML.style.opacity = "1";
    }, 350);
  }
  animar(0, 1, 1.2, (v) => (fotoMat.uniforms.u_progress.value = v), () => {
    fotoMat.uniforms.u_tex1.value = texturas[n];
    fotoMat.uniforms.u_progress.value = 0;
    tocando = false;
  });
  return true;
}
window.Cena3D = { transicao };

/* ---------------- arrastar para girar / clicar para trocar ---------------- */
const LIMITE = Math.PI / 4;
const alvo = { x: 0, y: 0 };
let arraste = null;

canvas.addEventListener("pointerdown", (e) => {
  arraste = { x: e.clientX, y: e.clientY, movido: 0, id: e.pointerId };
});
canvas.addEventListener("pointermove", (e) => {
  if (!arraste || e.pointerId !== arraste.id) return;
  const dx = e.clientX - arraste.x;
  const dy = e.clientY - arraste.y;
  arraste.movido = Math.max(arraste.movido, Math.hypot(dx, dy));
  const w = canvas.clientWidth || 1;
  alvo.y = THREE.MathUtils.clamp((dx / w) * Math.PI, -LIMITE, LIMITE);
  alvo.x = THREE.MathUtils.clamp((dy / w) * Math.PI, -LIMITE, LIMITE);
  if (arraste.movido > 6 && e.pointerType === "mouse") canvas.setPointerCapture(e.pointerId);
});
function soltar(e) {
  if (!arraste || e.pointerId !== arraste.id) return;
  const clique = arraste.movido < 6 && e.type === "pointerup";
  arraste = null;
  alvo.x = 0;
  alvo.y = 0; // volta ao centro, como o "snap" do original
  if (clique && window.Loja) window.Loja.proximoDestaque();
}
canvas.addEventListener("pointerup", soltar);
canvas.addEventListener("pointercancel", soltar);

/* ---------------- tamanho e responsividade ---------------- */
function ajustar() {
  const w = palco.clientWidth;
  const h = palco.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  // plano de fundo cobrindo toda a visão da câmera (em z = 0)
  const altura = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  fundo.scale.set(altura * camera.aspect, altura, 1);
  fundoMat.uniforms.u_aspect.value = camera.aspect;

  // em telas estreitas (celular em pé) o cartão diminui para caber
  const escala = THREE.MathUtils.clamp(camera.aspect / 0.85, 0.7, 1);
  suporte.scale.setScalar(escala);
}
new ResizeObserver(ajustar).observe(palco);
ajustar();

/* ---------------- laço de renderização (pausa fora da tela) ---------------- */
let visivel = true;
new IntersectionObserver(([ent]) => (visivel = ent.isIntersecting)).observe(palco);

const relogio = new THREE.Clock();
renderer.setAnimationLoop(() => {
  if (!visivel || document.hidden) return;
  const t = relogio.getElapsedTime();
  fundoMat.uniforms.u_time.value = t;
  fotoMat.uniforms.u_time.value = t;
  if (!reduzido) flutua.position.y = Math.sin(t) * 0.12;
  suporte.rotation.x += (alvo.x - suporte.rotation.x) * 0.08;
  suporte.rotation.y += (alvo.y - suporte.rotation.y) * 0.08;
  if (modoHTML) {
    // o cartão HTML segue a mesma rotação e flutuação do cartão 3D
    const rx = suporte.rotation.x + cartao.rotation.x;
    const ry = suporte.rotation.y + cartao.rotation.y;
    const dy = -flutua.position.y * 40;
    cartaoHTML.style.transform =
      `translate(-50%, -50%) translateY(${dy}px) rotateX(${-rx}rad) rotateY(${ry}rad)`;
  }
  renderer.render(cena, camera);
});
