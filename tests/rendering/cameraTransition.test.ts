import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  createBodyFocusPose,
  createCameraPose,
  createCameraTransition,
  advanceCameraTransition,
  interpolateCameraPose,
  isFiniteCameraPose
} from "../../src/rendering/cameraTransition";

describe("camera transitions", () => {
  it("interpolates from the exact start to the exact end", () => {
    const from = createCameraPose(new THREE.Vector3(0, 0, 10), new THREE.Vector3());
    const to = createCameraPose(new THREE.Vector3(10, 5, 0), new THREE.Vector3(1, 2, 3));

    expect(interpolateCameraPose(from, to, 0, 1).pose.position.toArray()).toEqual([0, 0, 10]);
    expect(interpolateCameraPose(from, to, 1, 1).pose.target.toArray()).toEqual([1, 2, 3]);
  });

  it("clamps transition progress and reports done", () => {
    const transition = createCameraTransition(
      createCameraPose(new THREE.Vector3(), new THREE.Vector3()),
      createCameraPose(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 2, 2)),
      1
    );

    const result = advanceCameraTransition(transition, 2);

    expect(result.done).toBe(true);
    expect(result.progress).toBe(1);
  });

  it("creates finite body focus poses with minimum distance", () => {
    const pose = createBodyFocusPose(new THREE.Vector3(4, 0, 2), 0.2, {
      cameraOffset: [0, 0, 0],
      minCameraDistance: 3
    });

    expect(isFiniteCameraPose(pose)).toBe(true);
    expect(pose.position.distanceTo(pose.target)).toBeGreaterThanOrEqual(3);
  });
});
