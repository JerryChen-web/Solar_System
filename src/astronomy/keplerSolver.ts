const TWO_PI = Math.PI * 2;

export interface KeplerSolverOptions {
  tolerance?: number;
  maxIterations?: number;
}

export interface KeplerSolverResult {
  eccentricAnomalyRad: number;
  converged: boolean;
  iterations: number;
  residual: number;
}

export const defaultKeplerSolverOptions: Required<KeplerSolverOptions> = {
  tolerance: 1e-12,
  maxIterations: 32
};

export function normalizeRadians(angle: number): number {
  if (!Number.isFinite(angle)) {
    throw new RangeError("Angle must be finite.");
  }
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

export function solveEllipticKeplerEquation(
  meanAnomalyRad: number,
  eccentricity: number,
  options: KeplerSolverOptions = {}
): KeplerSolverResult {
  if (!Number.isFinite(meanAnomalyRad)) {
    throw new RangeError("Mean anomaly must be finite.");
  }
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError("Eccentricity must be finite and in the range [0, 1).");
  }

  const { tolerance, maxIterations } = { ...defaultKeplerSolverOptions, ...options };
  if (tolerance <= 0 || maxIterations < 1) {
    throw new RangeError("Kepler solver tolerance and iteration limit must be positive.");
  }

  const normalizedMeanAnomaly = normalizeRadians(meanAnomalyRad);
  if (eccentricity < 1e-14) {
    return {
      eccentricAnomalyRad: normalizedMeanAnomaly,
      converged: true,
      iterations: 0,
      residual: 0
    };
  }

  let eccentricAnomaly =
    eccentricity < 0.8
      ? normalizedMeanAnomaly + eccentricity * Math.sin(normalizedMeanAnomaly)
      : Math.PI;

  let residual = Number.POSITIVE_INFINITY;
  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - normalizedMeanAnomaly;
    const fPrime = 1 - eccentricity * Math.cos(eccentricAnomaly);

    if (Math.abs(fPrime) < Number.EPSILON) {
      return {
        eccentricAnomalyRad: normalizeRadians(eccentricAnomaly),
        converged: false,
        iterations: iteration,
        residual: Math.abs(f)
      };
    }

    const delta = f / fPrime;
    eccentricAnomaly -= delta;
    residual = Math.abs(delta);

    if (!Number.isFinite(eccentricAnomaly)) {
      return {
        eccentricAnomalyRad: eccentricAnomaly,
        converged: false,
        iterations: iteration,
        residual
      };
    }

    if (residual <= tolerance) {
      return {
        eccentricAnomalyRad: normalizeRadians(eccentricAnomaly),
        converged: true,
        iterations: iteration,
        residual
      };
    }
  }

  return {
    eccentricAnomalyRad: normalizeRadians(eccentricAnomaly),
    converged: false,
    iterations: maxIterations,
    residual
  };
}

