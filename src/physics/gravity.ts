import type { Vector3Tuple } from "../types/vector";
import { GRAVITATIONAL_CONSTANT } from "../config/constants";
import type { BodyState } from "./bodyState";

function add(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtract(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale(v: Vector3Tuple, scalar: number): Vector3Tuple {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

function magnitudeSquared(v: Vector3Tuple): number {
  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

export function gravitationalAcceleration(target: BodyState, sources: BodyState[]): Vector3Tuple {
  return sources
    .filter((source) => source.body_id !== target.body_id)
    .reduce<Vector3Tuple>((acceleration, source) => {
      const displacement = subtract(source.position_m, target.position_m);
      const r2 = Math.max(magnitudeSquared(displacement), 1);
      const r = Math.sqrt(r2);
      const scalar = (GRAVITATIONAL_CONSTANT * source.mass_kg) / (r2 * r);
      return add(acceleration, scale(displacement, scalar));
    }, [0, 0, 0]);
}

