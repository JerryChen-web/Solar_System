import * as THREE from "three";

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#02040b");
  scene.fog = new THREE.FogExp2("#02040b", 0.0012);
  return scene;
}
