/*
 * Cena 3D do destaque — adaptação em Three.js puro do projeto
 * codrops-noise-transition (MIT): fundo com anel de ruído radial
 * e lata 3D com troca de cor por ruído na emenda.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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

/* ---------------- lata 3D com transição de textura ---------------- */
const uniformesLata = {
  u_time: { value: 0 },
  u_color1: { value: new THREE.Color(cores[0]) },
  u_color2: { value: new THREE.Color(cores[1]) },
  u_progress: { value: 0.5 },
  u_width: { value: 0.8 },
  u_scaleX: { value: 50 },
  u_scaleY: { value: 50 },
};

const suporte = new THREE.Group(); // recebe o arraste (como PresentationControls)
const flutua = new THREE.Group(); // sobe e desce
suporte.add(flutua);
cena.add(suporte);

let modeloPronto = false;
let tocando = false;

new GLTFLoader().load(new URL("../modelos/lata.glb", import.meta.url).href, (gltf) => {
  // Igual ao original: usa só a geometria das malhas, sem as escalas do Sketchfab
  const malhas = {};
  gltf.scene.traverse((obj) => { if (obj.isMesh) malhas[obj.name] = obj; });
  const corpo = malhas.LowRes_Can_Body_0;
  const tampa = malhas.LowRes_Can_Alluminium_0;

  const lata = new THREE.Group();
  lata.rotation.set(-Math.PI / 2, 1.7, Math.PI / 2);
  lata.position.set(0, 0, 5);
  const interno = new THREE.Group();
  interno.rotation.set(-Math.PI / 2, 0, 0);
  lata.add(interno);
  interno.add(new THREE.Mesh(tampa.geometry, tampa.material));
  interno.add(new THREE.Mesh(corpo.geometry, corpo.material));

  const m = corpo.material;
  m.metalness = 0;
  m.roughness = 1;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniformesLata);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vUv;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvUv = uv;");
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
        varying vec2 vUv;
        ${ruido}
        float parabola(float x, float k) { return pow(4. * x * (1. - x), k); }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
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
  m.needsUpdate = true;

  flutua.add(lata);
  modeloPronto = true;
  ajustar();
  palco.classList.add("pronto");
});

/* Troca a cor da lata e dispara o anel do fundo. Retorna false se ocupado. */
function transicao(cor) {
  if (tocando) return false;
  pulsoFundo(cor);
  if (!modeloPronto) {
    uniformesLata.u_color1.value.set(cor);
    return true;
  }
  tocando = true;
  uniformesLata.u_color2.value.set(cor);
  animar(0.5, 1, 1, (v) => (uniformesLata.u_progress.value = v), () => {
    uniformesLata.u_color1.value.set(cor);
    uniformesLata.u_progress.value = 0.5;
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

  // em telas estreitas (celular em pé) a lata diminui para caber
  const escala = THREE.MathUtils.clamp(camera.aspect / 1.1, 0.62, 1);
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
  uniformesLata.u_time.value = t;
  if (!reduzido) flutua.position.y = Math.sin(t) * 0.12;
  suporte.rotation.x += (alvo.x - suporte.rotation.x) * 0.08;
  suporte.rotation.y += (alvo.y - suporte.rotation.y) * 0.08;
  renderer.render(cena, camera);
});
