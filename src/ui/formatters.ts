import * as THREE from "three";
import { DAY_SECONDS, JULIAN_YEAR_SECONDS } from "../config/constants";
import { metersToAu } from "../physics/units";

export function formatOptional(value: unknown): string {
  return value === null || value === undefined || value === "" ? "N/A" : String(value);
}

export function formatScientific(value: number | undefined, unit: string): string {
  return Number.isFinite(value) && value !== undefined ? `${value.toExponential(4)} ${unit}` : "N/A";
}

export function formatNumber(value: number | undefined, unit = "", digits = 2): string {
  if (!Number.isFinite(value) || value === undefined) {
    return "N/A";
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: digits })}${unit ? ` ${unit}` : ""}`;
}

export function formatAuFromMeters(valueMeters: number | undefined): string {
  if (!Number.isFinite(valueMeters) || valueMeters === undefined) {
    return "N/A";
  }
  return `${metersToAu(valueMeters).toLocaleString(undefined, {
    maximumFractionDigits: 5,
    minimumFractionDigits: 0
  })} AU`;
}

export function formatDegrees(value: number | undefined): string {
  return formatNumber(value, "deg", 4);
}

export function formatTimeScale(secondsPerRealSecond: number): string {
  if (secondsPerRealSecond === 0) {
    return "paused";
  }
  if (secondsPerRealSecond < DAY_SECONDS) {
    return `${formatNumber(secondsPerRealSecond, "s/s", 0)}`;
  }
  if (secondsPerRealSecond < JULIAN_YEAR_SECONDS) {
    return `${(secondsPerRealSecond / DAY_SECONDS).toFixed(1)} days/s`;
  }
  return `${(secondsPerRealSecond / JULIAN_YEAR_SECONDS).toFixed(1)} years/s`;
}

export function formatVector(vector: THREE.Vector3): string {
  return `x ${vector.x.toFixed(2)}, y ${vector.y.toFixed(2)}, z ${vector.z.toFixed(2)}`;
}

