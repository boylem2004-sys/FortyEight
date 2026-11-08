import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const isCI = Boolean(process.env.CI);

/**
 * Smoke tests for the web app. Locally this starts `next dev`. In CI (or with
 * E2E_USE_BUILD=1) it runs the production build, so build first.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: isCI || process.env.E2E_USE_BUILD ? `pnpm start -p ${PORT}` : `pnpm dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/v1/health`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
