import { describe, expect, it } from "vitest";
import { focusSceneConfigs, getFocusSceneConfig } from "../../src/rendering/focusSceneManager";
import { FOCUS_BODY_IDS } from "../../src/rendering/sceneModes";

describe("focus scene configs", () => {
  it("defines every required V1.0 planet focus ecosystem", () => {
    expect(Object.keys(focusSceneConfigs).sort()).toEqual([...FOCUS_BODY_IDS].sort());
  });

  it("provides display copy, accent color, and camera offset for every focus body", () => {
    for (const bodyId of FOCUS_BODY_IDS) {
      const config = getFocusSceneConfig(bodyId);

      expect(config?.title.length).toBeGreaterThan(0);
      expect(config?.subtitle.length).toBeGreaterThan(0);
      expect(config?.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(config?.cameraOffset).toHaveLength(3);
      expect(config?.minCameraDistance).toBeGreaterThan(0);
    }
  });
});
