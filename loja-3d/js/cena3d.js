/*
 * Cena 3D do destaque — adaptação em Three.js puro do projeto
 * codrops-noise-transition (MIT): fundo com anel de ruído radial
 * e um fone de ouvido 3D (modelado em código) com troca de cor por
 * ruído na emenda, a mesma técnica que o original aplica na lata.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
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

/* ---------------- fone 3D com transição de cor ---------------- */
const uniformesFone = {
  u_time: { value: 0 },
  u_color1: { value: new THREE.Color(cores[0]) },
  u_color2: { value: new THREE.Color(cores[1]) },
  u_progress: { value: 0.5 },
  u_width: { value: 0.8 },
  u_scaleX: { value: 50 },
  u_scaleY: { value: 50 },
  u_centro: { value: new THREE.Vector2() }, // centro do fone na tela do mundo
  u_tamanho: { value: new THREE.Vector2(5.4, 5.4) },
};

const suporte = new THREE.Group(); // recebe o arraste (como PresentationControls)
const flutua = new THREE.Group(); // sobe e desce
suporte.add(flutua);
cena.add(suporte);

// Casca colorida: o shader do original, mas a coordenada da emenda vem da
// posição no mundo (o fone é feito de várias peças, sem uma UV única).
const casca = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.15, roughness: 0.42 });
casca.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, uniformesFone);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec2 vPosMundo;")
    .replace(
      "#include <worldpos_vertex>",
      "#include <worldpos_vertex>\nvPosMundo = (modelMatrix * vec4(transformed, 1.0)).xy;"
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_progress;
      uniform float u_width;
      uniform float u_scaleX;
      uniform float u_scaleY;
      uniform vec2 u_centro;
      uniform vec2 u_tamanho;
      varying vec2 vPosMundo;
      ${ruido}
      float parabola(float x, float k) { return pow(4. * x * (1. - x), k); }`
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      vec2 vUv = (vPosMundo - u_centro) / u_tamanho + 0.5;
      float dt = parabola(u_progress, 1.);
      float border = 1.;
      float noise = 0.5 * (cnoise(vec4(vUv.x * u_scaleX + 0.5 * u_time / 3., vUv.y * u_scaleY, 0.5 * u_time / 3., 0.)) + 1.);
      float w = u_width * dt;
      float maskValue = smoothstep(1. - w, 1., vUv.y + mix(-w / 2., 1. - w / 2., u_progress));
      maskValue += maskValue * noise;
      float mask = smoothstep(border, border + 0.01, maskValue);
      diffuseColor.rgb += mix(u_color1, u_color2, mask);`
    );
};
// garante que o three não reaproveite o programa de outro MeshStandardMaterial
casca.customProgramCacheKey = () => "casca-fone";

const espuma = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.95, metalness: 0 });
const metal = new THREE.MeshStandardMaterial({ color: 0xd9d9de, roughness: 0.22, metalness: 1 });

function montarFone() {
  const fone = new THREE.Group();

  // arco superior
  const arco = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.2, 32, 96, Math.PI), casca);
  arco.scale.set(1, 1.08, 1.35);
  fone.add(arco);
  const almofadaArco = new THREE.Mesh(new THREE.TorusGeometry(1.86, 0.13, 24, 64, Math.PI * 0.62), espuma);
  almofadaArco.rotation.z = Math.PI * 0.19;
  almofadaArco.scale.set(1, 1.08, 1);
  fone.add(almofadaArco);

  // concha: perfil arredondado girado (lathe)
  const perfil = [
    [0, -0.38], [0.86, -0.38], [0.99, -0.3], [1.04, -0.12],
    [1.04, 0.14], [0.97, 0.31], [0.82, 0.38], [0, 0.38],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geoConcha = new THREE.LatheGeometry(perfil, 64);

  for (const lado of [-1, 1]) {
    const x = 2.05 * lado;

    // haste de ajuste
    const haste = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.34), metal);
    haste.position.set(x, -0.35, 0);
    fone.add(haste);

    const concha = new THREE.Mesh(geoConcha, casca);
    concha.rotation.z = Math.PI / 2;
    concha.position.set(x + 0.12 * lado, -1.55, 0);
    fone.add(concha);

    const anel = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.035, 12, 64), metal);
    anel.rotation.y = Math.PI / 2;
    anel.position.set(x + 0.52 * lado, -1.55, 0);
    fone.add(anel);

    const almofada = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.3, 24, 64), espuma);
    almofada.rotation.y = Math.PI / 2;
    almofada.scale.set(1, 1, 0.8);
    almofada.position.set(x - 0.42 * lado, -1.55, 0);
    fone.add(almofada);
  }

  fone.position.set(0, 0.55, 5);
  fone.rotation.set(0.12, -0.55, 0);
  return fone;
}

flutua.add(montarFone());
let tocando = false;

/* Troca a cor do fone e dispara o anel do fundo. Retorna false se ocupado. */
function transicao(cor) {
  if (tocando) return false;
  pulsoFundo(cor);
  tocando = true;
  uniformesFone.u_color2.value.set(cor);
  animar(0.5, 1, 1, (v) => (uniformesFone.u_progress.value = v), () => {
    uniformesFone.u_color1.value.set(cor);
    uniformesFone.u_progress.value = 0.5;
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

  // em telas estreitas (celular em pé) o fone diminui para caber
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
  uniformesFone.u_time.value = t;
  if (!reduzido) flutua.position.y = Math.sin(t) * 0.12;
  const esc = suporte.scale.x;
  uniformesFone.u_centro.value.set(0, (0.55 + flutua.position.y) * esc - 0.4 * esc);
  uniformesFone.u_tamanho.value.set(5.4 * esc, 5.4 * esc);
  suporte.rotation.x += (alvo.x - suporte.rotation.x) * 0.08;
  suporte.rotation.y += (alvo.y - suporte.rotation.y) * 0.08;
  renderer.render(cena, camera);
});
