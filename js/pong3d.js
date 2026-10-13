import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const viewers = document.querySelectorAll(".pong-3d");

// ── 3D 퐁이 모델 조절값 ────────────────────────────────
// modelScale   : 모델 자체 크기
// rotation     : 처음 보이는 모델의 회전값 (라디안)
// autoRotateSpeed : 자동 회전 속도 (0이면 멈춤)
const pongOptions = {
  modelScale: 3.5,
  rotation: { x: 0, y: 0, z: 0 },
  autoRotateSpeed: 0.8,
};

viewers.forEach((viewer) => {
  const canvas = viewer.querySelector(".pong-3d-canvas");
  if (!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
  camera.position.set(0, 0.15, 7);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x75c5c8, 1.35));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const shineLight = new THREE.PointLight(0xffffff, 20, 20);
shineLight.position.set(2, 4, 4);
scene.add(shineLight);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.5;
  controls.maxDistance = 7;

  const pivot = new THREE.Group();
  pivot.rotation.set(pongOptions.rotation.x, pongOptions.rotation.y, pongOptions.rotation.z);
  scene.add(pivot);
  let model;
  new GLTFLoader().load("./3D/pong-E.glb", (gltf) => {
    model = gltf.scene;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    // 내부가 재질을 만지는 위치입니다.
    model.traverse((object) => {
      
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        if ("roughness" in material) {
  material.roughness = 0.08;
  material.metalness = 0;
  material.needsUpdate = true;
}
        if (material.map) {
          material.map.anisotropy = maxAnisotropy;
          material.map.needsUpdate = true;
          material.roughness = 0.10; // 낮을수록 반짝임
          material.metalness = 0.05; // 플라스틱은 낮게
        }
      });
    });
    pivot.add(model);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z) || 1;
    const scale = pongOptions.modelScale / maxSize;
    model.scale.setScalar(scale);
    model.position.copy(center).multiplyScalar(-scale);
    controls.target.set(0, 0, 0);
    controls.update();
    viewer.classList.add("is-ready");
  }, undefined, (error) => {
    console.error("퐁이 3D 모델을 불러오지 못했습니다.", error);
    const status = viewer.querySelector(".pong-3d-status");
    if (status) status.textContent = "3D 모델을 불러오지 못했어요.";
  });

  const resize = () => {
    const { width, height } = viewer.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(viewer);
  resize();

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  const render = () => {
    const delta = Math.min(clock.getDelta(), 0.05);
    if (model && !reduceMotion && !canvas.matches(":active")) {
      pivot.rotation.y += delta * pongOptions.autoRotateSpeed;
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  render();
});
