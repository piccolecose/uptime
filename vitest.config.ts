import path from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(path.join(import.meta.dirname, "migrations")),
          // status.yaml interpolates these; without them the config is invalid.
          NTFY_URL: "https://ntfy.test/alerts",
          HEARTBEAT_TOKEN: "test-token",
        },
      },
    })),
  ],
  test: {
    setupFiles: ["./test/apply-migrations.ts"],
    // Off for `pnpm test`; `pnpm test:coverage` (and CI) turns it on. istanbul
    // because v8 coverage does not reach inside the workerd pool.
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.ts"],
      reporter: ["text", "json-summary"],
      thresholds: { lines: 75 },
    },
  },
});
