import { defineConfig, devices } from "@playwright/test"
const port = process.env.E2E_PORT ?? "3000"
const baseURL = `http://127.0.0.1:${port}`
export default defineConfig({ testDir: "tests/e2e", fullyParallel: false, workers: 1, forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0, reporter: process.env.CI ? [["json", { outputFile: "reports/e2e-results.json" }], ["line"]] : "line", use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" }, projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }, { name: "mobile-chromium", use: { ...devices["Pixel 7"] } }], webServer: { command: `npm start -- --port ${port}`, url: baseURL, reuseExistingServer: false, timeout: 60000 }, globalSetup: "./tests/e2e/global-setup.ts" })
