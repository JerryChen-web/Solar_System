import { describe, expect, it } from "vitest";
import {
  createOverviewMode,
  enterBodyFocusMode,
  exitBodyFocusMode,
  isFocusBodyId
} from "../../src/rendering/sceneModes";

describe("scene mode helpers", () => {
  it("enters focus mode for supported planets", () => {
    const mode = enterBodyFocusMode(createOverviewMode(), "earth");

    expect(mode).toEqual({ kind: "body-focus", bodyId: "earth" });
  });

  it("returns to overview mode", () => {
    expect(exitBodyFocusMode()).toEqual({ kind: "overview" });
  });

  it("keeps the current mode for unsupported bodies", () => {
    const current = createOverviewMode();

    expect(enterBodyFocusMode(current, "moon")).toBe(current);
    expect(isFocusBodyId("sun")).toBe(false);
  });
});
