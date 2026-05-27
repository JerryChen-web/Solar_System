import { describe, expect, it } from "vitest";
import { GITHUB_PAGES_BASE, resolveViteBase } from "../../vite.config";

describe("vite deployment config", () => {
  it("uses the Solar_System GitHub Pages base for production builds", () => {
    expect(GITHUB_PAGES_BASE).toBe("/Solar_System/");
    expect(resolveViteBase("build")).toBe("/Solar_System/");
  });

  it("keeps local dev served from the root path", () => {
    expect(resolveViteBase("serve")).toBe("/");
  });

  it("uses the GitHub Pages base while previewing the production build", () => {
    expect(resolveViteBase("serve", true)).toBe("/Solar_System/");
  });
});
