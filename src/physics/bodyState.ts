import type { Vector3Tuple } from "../types/vector";

export interface BodyState {
  body_id: string;
  mass_kg: number;
  position_m: Vector3Tuple;
  velocity_m_s: Vector3Tuple;
}

