import { describe, expect, it } from "vitest";
import { APP_VERSION, APP_VERSION_LABEL } from "../../src/config/appMetadata";

describe("app metadata", () => {
  it("exposes the V1.0 public stable release label", () => {
    expect(APP_VERSION).toBe("1.0.0");
    expect(APP_VERSION_LABEL).toBe("Solar_System V1.0.0");
  });
});
