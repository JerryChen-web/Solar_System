import * as THREE from "three";

export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export interface CameraTransitionState {
  from: CameraPose;
  to: CameraPose;
  elapsedSeconds: number;
  durationSeconds: number;
}

export interface FocusCameraOptions {
  cameraOffset: readonly [number, number, number];
  minCameraDistance: number;
}

export function createCameraPose(position: THREE.Vector3, target: THREE.Vector3): CameraPose {
  return {
    position: position.clone(),
    target: target.clone()
  };
}

export function cloneCameraPose(pose: CameraPose): CameraPose {
  return createCameraPose(pose.position, pose.target);
}

export function createCameraTransition(
  from: CameraPose,
  to: CameraPose,
  durationSeconds: number
): CameraTransitionState {
  return {
    from: cloneCameraPose(from),
    to: cloneCameraPose(to),
    elapsedSeconds: 0,
    durationSeconds: Math.max(durationSeconds, 0.001)
  };
}

export function easeInOutCubic(progress: number): number {
  const clamped = THREE.MathUtils.clamp(progress, 0, 1);
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

export function interpolateCameraPose(
  from: CameraPose,
  to: CameraPose,
  elapsedSeconds: number,
  durationSeconds: number
): { pose: CameraPose; progress: number; done: boolean } {
  const duration = Math.max(durationSeconds, 0.001);
  const progress = THREE.MathUtils.clamp(elapsedSeconds / duration, 0, 1);
  const eased = easeInOutCubic(progress);

  return {
    pose: {
      position: from.position.clone().lerp(to.position, eased),
      target: from.target.clone().lerp(to.target, eased)
    },
    progress,
    done: progress >= 1
  };
}

export function advanceCameraTransition(
  transition: CameraTransitionState,
  deltaSeconds: number
): { transition: CameraTransitionState; pose: CameraPose; done: boolean; progress: number } {
  const elapsedSeconds = Math.min(
    transition.elapsedSeconds + Math.max(deltaSeconds, 0),
    transition.durationSeconds
  );
  const updatedTransition = {
    ...transition,
    elapsedSeconds
  };
  const result = interpolateCameraPose(
    updatedTransition.from,
    updatedTransition.to,
    updatedTransition.elapsedSeconds,
    updatedTransition.durationSeconds
  );

  return {
    transition: updatedTransition,
    pose: result.pose,
    done: result.done,
    progress: result.progress
  };
}

export function createBodyFocusPose(
  bodyPosition: THREE.Vector3,
  radiusSceneUnits: number,
  options: FocusCameraOptions
): CameraPose {
  const offset = new THREE.Vector3(...options.cameraOffset);
  const minDistance = Math.max(options.minCameraDistance, radiusSceneUnits * 7);

  if (!Number.isFinite(offset.lengthSq()) || offset.lengthSq() === 0) {
    offset.set(minDistance, minDistance * 0.35, minDistance);
  }

  if (offset.length() < minDistance) {
    offset.setLength(minDistance);
  }

  return {
    position: bodyPosition.clone().add(offset),
    target: bodyPosition.clone()
  };
}

export function isFiniteCameraPose(pose: CameraPose): boolean {
  return (
    Number.isFinite(pose.position.x) &&
    Number.isFinite(pose.position.y) &&
    Number.isFinite(pose.position.z) &&
    Number.isFinite(pose.target.x) &&
    Number.isFinite(pose.target.y) &&
    Number.isFinite(pose.target.z)
  );
}
