import { AU_METERS } from "../config/constants";
import type { OrbitalElementRecord } from "../types/orbit";
import {
  createUnavailableReference,
  type ReferenceLookupContext,
  type ReferenceLookupResult,
  type ReferenceProvider,
  type ValidationReferenceRange
} from "./referenceAdapter";

export const SUN_ORIGIN_TOLERANCE_METERS = 1_000;

export const MOON_EARTH_REFERENCE_RANGE: ValidationReferenceRange = {
  minMeters: 3.5e8,
  maxMeters: 4.1e8,
  warnToleranceMeters: 2.5e7
};

export function rangeFromOrbitalElement(element: OrbitalElementRecord): ValidationReferenceRange {
  const semiMajorAxisMeters = element.a_au * AU_METERS;
  return {
    minMeters: semiMajorAxisMeters * (1 - element.e),
    maxMeters: semiMajorAxisMeters * (1 + element.e),
    warnToleranceMeters: Math.max(semiMajorAxisMeters * 0.025, 10_000)
  };
}

export const localReferenceProvider: ReferenceProvider = {
  metadata: {
    id: "local-approximate",
    label: "Local approximate reference",
    description: "Local sanity-check ranges derived from bundled orbital elements and fixed Moon-Earth bounds.",
    accuracyNote: "Local approximate validation only; not NASA/JPL Horizons or SPICE precision data."
  },

  getBodyReference(bodyId: string, context: ReferenceLookupContext): ReferenceLookupResult {
    const body = context.bodyById.get(bodyId);
    if (!body) {
      return createUnavailableReference(bodyId, this.metadata.id, "Unknown body id.");
    }

    if (body.id === "sun") {
      return {
        available: true,
        bodyId: body.id,
        referenceBodyId: null,
        kind: "sun-origin",
        range: {
          minMeters: 0,
          maxMeters: SUN_ORIGIN_TOLERANCE_METERS,
          warnToleranceMeters: 0
        },
        providerId: this.metadata.id,
        note: "Sun is validated as the local reference body near the origin."
      };
    }

    if (body.id === "moon") {
      return this.getMoonEarthDistanceReference(context);
    }

    const element = context.orbitalElementByBodyId.get(body.id);
    if (!element) {
      return createUnavailableReference(
        body.id,
        this.metadata.id,
        "No local orbital elements are available for this body."
      );
    }

    return {
      available: true,
      bodyId: body.id,
      referenceBodyId: "sun",
      kind: "heliocentric-distance",
      range: rangeFromOrbitalElement(element),
      providerId: this.metadata.id,
      note: "Planet distance range is derived from bundled approximate orbital elements."
    };
  },

  getMoonEarthDistanceReference(context: ReferenceLookupContext): ReferenceLookupResult {
    if (!context.bodyById.has("moon") || !context.bodyById.has("earth")) {
      return createUnavailableReference(
        "moon",
        this.metadata.id,
        "Moon-Earth reference requires both Moon and Earth body records."
      );
    }

    return {
      available: true,
      bodyId: "moon",
      referenceBodyId: "earth",
      kind: "moon-earth-distance",
      range: MOON_EARTH_REFERENCE_RANGE,
      providerId: this.metadata.id,
      note: "Moon-Earth distance uses a fixed local approximate sanity range."
    };
  }
};
