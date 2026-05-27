import { defineConfig, type ConfigEnv } from "vite";

export const GITHUB_PAGES_BASE = "/Solar_System/";

export function resolveViteBase(command: ConfigEnv["command"], isPreview = false): string {
  return command === "build" || isPreview ? GITHUB_PAGES_BASE : "/";
}

export default defineConfig(({ command, isPreview }) => ({
  base: resolveViteBase(command, isPreview),
  server: {
    host: "127.0.0.1"
  }
}));

