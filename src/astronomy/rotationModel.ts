import type { BodyRecord } from "../types/body";

export function rotationRadiansForElapsedSeconds(body: BodyRecord, secondsSinceEpoch: number): number {
  if (body.rotation_period_s === 0) {
    return 0;
  }
  return (secondsSinceEpoch / body.rotation_period_s) * Math.PI * 2;
}

