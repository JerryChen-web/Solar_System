import type { Vector3Tuple } from "../types/vector";
import type { BodyState } from "./bodyState";
import { gravitationalAcceleration } from "./gravity";

function addScaled(vector: Vector3Tuple, delta: Vector3Tuple, scale: number): Vector3Tuple {
  return [
    vector[0] + delta[0] * scale,
    vector[1] + delta[1] * scale,
    vector[2] + delta[2] * scale
  ];
}

export function velocityVerletStep(states: BodyState[], dtSeconds: number): BodyState[] {
  const initialAccelerations = new Map(
    states.map((state) => [state.body_id, gravitationalAcceleration(state, states)])
  );

  const drifted = states.map((state) => {
    const acceleration = initialAccelerations.get(state.body_id) ?? [0, 0, 0];
    const position_m = addScaled(
      addScaled(state.position_m, state.velocity_m_s, dtSeconds),
      acceleration,
      0.5 * dtSeconds * dtSeconds
    );
    return { ...state, position_m };
  });

  return drifted.map((state, index) => {
    const original = states[index];
    const a0 = initialAccelerations.get(state.body_id) ?? [0, 0, 0];
    const a1 = gravitationalAcceleration(state, drifted);
    const velocity_m_s = addScaled(original.velocity_m_s, [
      a0[0] + a1[0],
      a0[1] + a1[1],
      a0[2] + a1[2]
    ], 0.5 * dtSeconds);
    return { ...state, velocity_m_s };
  });
}

