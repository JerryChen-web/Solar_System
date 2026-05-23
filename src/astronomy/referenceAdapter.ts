import type { BodyRecord } from "../types/body";
import type { OrbitalElementRecord } from "../types/orbit";

export type ReferenceKind =
  | "sun-origin"
  | "heliocentric-distance"
  | "moon-earth-distance"
  | "unavailable";

export interface ValidationReferenceRange {
  minMeters: number;
  maxMeters: number;
  warnToleranceMeters: number;
}

export interface ReferenceProviderMetadata {
  id: string;
  label: string;
  description: string;
  accuracyNote: string;
}

export interface ReferenceLookupContext {
  bodies: BodyRecord[];
  bodyById: Map<string, BodyRecord>;
  orbitalElementByBodyId: Map<string, OrbitalElementRecord>;
}

export interface AvailableReference {
  available: true;
  bodyId: string;
  referenceBodyId: string | null;
  kind: Exclude<ReferenceKind, "unavailable">;
  range: ValidationReferenceRange;
  providerId: string;
  note: string;
}

export interface UnavailableReference {
  available: false;
  bodyId: string;
  referenceBodyId: string | null;
  kind: "unavailable";
  range?: undefined;
  providerId: string;
  note: string;
}

export type ReferenceLookupResult = AvailableReference | UnavailableReference;

export interface ReferenceProvider {
  metadata: ReferenceProviderMetadata;
  getBodyReference(bodyId: string, context: ReferenceLookupContext): ReferenceLookupResult;
  getMoonEarthDistanceReference(context: ReferenceLookupContext): ReferenceLookupResult;
}

export function createUnavailableReference(
  bodyId: string,
  providerId: string,
  note = "No reference is available for this body."
): UnavailableReference {
  return {
    available: false,
    bodyId,
    referenceBodyId: null,
    kind: "unavailable",
    providerId,
    note
  };
}
