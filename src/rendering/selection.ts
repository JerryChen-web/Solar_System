import * as THREE from "three";

export function pickBodyId(
  event: PointerEvent,
  camera: THREE.Camera,
  domElement: HTMLElement,
  pickableMeshes: THREE.Object3D[]
): string | null {
  const rect = domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickableMeshes, false)[0];
  return typeof hit?.object.userData.bodyId === "string" ? hit.object.userData.bodyId : null;
}

