import * as THREE from "three";

export function cloneSceneVector(vector: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(vector.x, vector.y, vector.z);
}

