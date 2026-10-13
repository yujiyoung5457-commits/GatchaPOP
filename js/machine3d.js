import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const viewer=document.querySelector(".machine-3d");
const canvas=viewer?.querySelector(".machine-3d-canvas");
if(viewer&&canvas){
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(30,1,.01,100); camera.position.set(3.2,1.8,5.5);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.NeutralToneMapping; renderer.toneMappingExposure=1.2;
 scene.add(new THREE.HemisphereLight(0xffffff,0x75c5c8,1.35));
 const key=new THREE.DirectionalLight(0xffffff,1.2); key.position.set(3,5,5); scene.add(key);
 const fill=new THREE.DirectionalLight(0xffcf4c,.65); fill.position.set(-4,2,-2); scene.add(fill);
 const controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.enablePan=false;
 controls.minDistance=3.5; controls.maxDistance=8;
 const pivot=new THREE.Group(); scene.add(pivot); let model;
 new GLTFLoader().load("./3D/machine.glb",gltf=>{
  model=gltf.scene; pivot.add(model);
  const maxAnisotropy=renderer.capabilities.getMaxAnisotropy();
  model.traverse(object=>{
   const materials=Array.isArray(object.material)?object.material:[object.material];
   materials.filter(Boolean).forEach(material=>{
    if(material.map){material.map.anisotropy=maxAnisotropy;material.map.needsUpdate=true;}
   });
  });
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const scale=3.35/(Math.max(size.x,size.y,size.z)||1);
  model.scale.setScalar(scale); model.position.copy(center).multiplyScalar(-scale);
  const sphere=new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
  const verticalFov=THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*camera.aspect);
  const fitFov=Math.min(verticalFov,horizontalFov);
  const distance=(sphere.radius/Math.sin(fitFov/2))*.66;
  camera.position.copy(camera.position.clone().normalize().multiplyScalar(distance));
  camera.near=Math.max(distance/100,.01); camera.far=distance*10; camera.updateProjectionMatrix();
  controls.minDistance=distance*.55; controls.maxDistance=distance*2;
  controls.update(); viewer.classList.add("is-ready");
 },undefined,error=>{console.error("Could not load the 3D machine.",error); const status=viewer.querySelector(".machine-3d-status"); if(status)status.textContent="Could not load 3D model.";});
 const resize=()=>{const{width,height}=viewer.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
 new ResizeObserver(resize).observe(viewer); resize();
 const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches,clock=new THREE.Clock();
 const render=()=>{const delta=Math.min(clock.getDelta(),.05);if(model&&!reduceMotion&&!canvas.matches(":active"))pivot.rotation.y+=delta*.35;controls.update();renderer.render(scene,camera);requestAnimationFrame(render);}; render();
}
