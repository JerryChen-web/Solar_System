import * as THREE from "three";

export interface PickableBodyTarget {
  bodyId: string;
  object: THREE.Object3D;
  radiusSceneUnits: number;
}

export function pickBodyId(
  event: PointerEvent,
  camera: THREE.Camera,
  domElement: HTMLElement,
  pickableMeshes: THREE.Object3D[],
  fallbackTargets: PickableBodyTarget[] = []
): string | null {
  const rect = domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const pointerPixels = new THREE.Vector2(event.clientX - rect.left, event.clientY - rect.top);
  let nearest: { bodyId: string; distancePixels: number } | null = null;

  for (const target of fallbackTargets) {
    const worldPosition = new THREE.Vector3();
    target.object.getWorldPosition(worldPosition);
    const projected = worldPosition.clone().project(camera);
    if (projected.z < -1 || projected.z > 1) {
      continue;
    }

    const screenPosition = new THREE.Vector2(
      (projected.x * 0.5 + 0.5) * rect.width,
      (-projected.y * 0.5 + 0.5) * rect.height
    );
    const distancePixels = screenPosition.distanceTo(pointerPixels);
    const cameraDistance = Math.max(camera.position.distanceTo(worldPosition), 0.001);
    const projectedRadiusPixels = (target.radiusSceneUnits / cameraDistance) * rect.height * 2.1;
    const thresholdPixels = THREE.MathUtils.clamp(projectedRadiusPixels, 14, 36);

    if (distancePixels <= thresholdPixels && (!nearest || distancePixels < nearest.distancePixels)) {
      nearest = {
        bodyId: target.bodyId,
        distancePixels
      };
    }
  }

  if (nearest) {
    return nearest.bodyId;
  }

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickableMeshes, false)[0];
  return typeof hit?.object.userData.bodyId === "string" ? hit.object.userData.bodyId : null;
}

export class SelectionHighlighter {
  private highlight: THREE.Group | null = null;
  private parent: THREE.Object3D | null = null;

  select(target: THREE.Object3D, radiusSceneUnits: number): void {
    this.clear();

    const group = new THREE.Group();
    group.name = "Selected body highlight";

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(radiusSceneUnits * 1.42, 48, 24),
      new THREE.MeshBasicMaterial({
        color: "#ffd166",
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        side: THREE.BackSide
      })
    );
    group.add(shell);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radiusSceneUnits * 1.55, Math.max(radiusSceneUnits * 0.025, 0.012), 12, 96),
      new THREE.MeshBasicMaterial({
        color: "#ffe7a3",
        transparent: true,
        opacity: 0.86,
        depthWrite: false
      })
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    target.add(group);
    this.highlight = group;
    this.parent = target;
  }

  clear(): void {
    if (!this.highlight || !this.parent) {
      return;
    }

    this.parent.remove(this.highlight);
    this.highlight.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.highlight = null;
    this.parent = null;
  }
}
