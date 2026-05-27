import { describe, expect, it } from "vitest";
import { APP_VERSION, APP_VERSION_LABEL } from "../../src/config/appMetadata";

describe("app metadata", () => {
  it("exposes the V0.9 release label", () => {
    expect(APP_VERSION).toBe("0.9.0");
    expect(APP_VERSION_LABEL).toBe("Solar_System V0.9.0");
  });
});
