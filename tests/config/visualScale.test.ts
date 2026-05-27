import { describe, expect, it } from "vitest";
import { sceneDistanceForSolarDistanceAu } from "../../src/config/visualScale";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("visual scale", () => {
  const { visualConfig } = loadSolarSystemData();

  it("keeps outer planets progressively farther than the inner system", () => {
    const marsLike = sceneDistanceForSolarDistanceAu(1.5, visualConfig);
    const jupiterLike = sceneDistanceForSolarDistanceAu(5.2, visualConfig);
    const neptuneLike = sceneDistanceForSolarDistanceAu(30, visualConfig);

    expect(jupiterLike).toBeGreaterThan(marsLike);
    expect(neptuneLike).toBeGreaterThan(jupiterLike);
  });
});
