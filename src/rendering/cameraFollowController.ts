import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class CameraFollowController {
  private followTargetId: string | null = null;
  private readonly smoothing = 8;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls
  ) {}

  getTargetId(): string | null {
    return this.followTargetId;
  }

  follow(bodyId: string, currentTargetPosition: THREE.Vector3): void {
    this.followTargetId = bodyId;
    this.controls.target.lerp(currentTargetPosition, 0.35);
  }

  stop(): void {
    this.followTargetId = null;
  }

  update(targetPosition: THREE.Vector3 | undefined, deltaSeconds: number): void {
    if (!this.followTargetId || !targetPosition) {
      return;
    }

    const previousTarget = this.controls.target.clone();
    const alpha = 1 - Math.exp(-this.smoothing * Math.max(deltaSeconds, 0));
    this.controls.target.lerp(targetPosition, alpha);
    const targetDelta = this.controls.target.clone().sub(previousTarget);
    this.camera.position.add(targetDelta);
  }
}

