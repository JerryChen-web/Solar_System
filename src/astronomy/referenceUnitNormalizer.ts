import { AU_METERS } from "../config/constants";

export type SupportedReferenceUnit = "au" | "km" | "m";

export type UnitNormalizationResult =
  | {
      ok: true;
      value: number;
      unit: SupportedReferenceUnit;
      message?: string;
    }
  | {
      ok: false;
      value?: undefined;
      unit?: undefined;
      message: string;
    };

export function normalizeReferenceUnit(unit: unknown): SupportedReferenceUnit | undefined {
  if (typeof unit !== "string") {
    return undefined;
  }

  const normalized = unit.trim().toLowerCase();
  if (normalized === "au" || normalized === "astronomical_unit" || normalized === "astronomical-unit") {
    return "au";
  }
  if (normalized === "km" || normalized === "kilometer" || normalized === "kilometers") {
    return "km";
  }
  if (normalized === "m" || normalized === "meter" || normalized === "meters") {
    return "m";
  }
  return undefined;
}

function finiteValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function toMeters(value: unknown, unit: unknown): UnitNormalizationResult {
  const numericValue = finiteValue(value);
  if (numericValue === undefined) {
    return { ok: false, message: "Reference value must be a finite number." };
  }

  const normalizedUnit = normalizeReferenceUnit(unit);
  if (!normalizedUnit) {
    return { ok: false, message: `Unsupported reference unit: ${String(unit ?? "N/A")}.` };
  }

  if (normalizedUnit === "m") {
    return { ok: true, value: numericValue, unit: "m" };
  }
  if (normalizedUnit === "km") {
    return { ok: true, value: numericValue * 1_000, unit: "m" };
  }
  return { ok: true, value: numericValue * AU_METERS, unit: "m" };
}

export function toAu(value: unknown, unit: unknown): UnitNormalizationResult {
  const numericValue = finiteValue(value);
  if (numericValue === undefined) {
    return { ok: false, message: "Reference value must be a finite number." };
  }

  const normalizedUnit = normalizeReferenceUnit(unit);
  if (!normalizedUnit) {
    return { ok: false, message: `Unsupported reference unit: ${String(unit ?? "N/A")}.` };
  }

  if (normalizedUnit === "au") {
    return { ok: true, value: numericValue, unit: "au" };
  }
  if (normalizedUnit === "km") {
    return { ok: true, value: (numericValue * 1_000) / AU_METERS, unit: "au" };
  }
  return { ok: true, value: numericValue / AU_METERS, unit: "au" };
}
