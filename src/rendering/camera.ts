import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { VisualConfig } from "../types/config";

export function createCamera(visualConfig: VisualConfig, container: HTMLElement): THREE.PerspectiveCamera {
  const [x, y, z] = visualConfig.camera.default_position;
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / Math.max(container.clientHeight, 1),
    visualConfig.camera.near,
    visualConfig.camera.far
  );
  camera.position.set(x, y, z);
  return camera;
}

export function createOrbitControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 3;
  controls.maxDistance = 400;
  controls.target.set(0, 0, 0);
  controls.update();
  return controls;
}

