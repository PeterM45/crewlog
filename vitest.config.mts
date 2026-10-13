import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

process.loadEnvFile();

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL as string },
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
  },
});
