import { describe, expect, it } from "vitest";
import { generateBeltDistribution } from "../../src/rendering/smallBodyBelts";

describe("small-body belt generation", () => {
  it("is deterministic for the same seed", () => {
    const first = generateBeltDistribution({
      count: 6,
      innerRadius: 10,
      outerRadius: 20,
      verticalSpread: 2,
      seed: 42
    });
    const second = generateBeltDistribution({
      count: 6,
      innerRadius: 10,
      outerRadius: 20,
      verticalSpread: 2,
      seed: 42
    });

    expect(first.map((particle) => particle.position.toArray())).toEqual(
      second.map((particle) => particle.position.toArray())
    );
  });

  it("honors count and radius range without NaN positions", () => {
    const particles = generateBeltDistribution({
      count: 20,
      innerRadius: 8,
      outerRadius: 12,
      verticalSpread: 1,
      seed: 7
    });

    expect(particles).toHaveLength(20);
    for (const particle of particles) {
      expect(particle.radius).toBeGreaterThanOrEqual(8);
      expect(particle.radius).toBeLessThanOrEqual(12);
      expect(Number.isFinite(particle.position.x)).toBe(true);
      expect(Number.isFinite(particle.position.y)).toBe(true);
      expect(Number.isFinite(particle.position.z)).toBe(true);
    }
  });
});
