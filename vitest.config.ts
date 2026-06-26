import { defineConfig } from "vitest/config";

// Settings for our test runner. This is intentionally tiny — we're only
// testing plain functions for now, so there's nothing fancy to configure.
export default defineConfig({
  test: {
    // "node" = run tests in a plain Node.js environment (no fake browser).
    // Our code under test is pure logic, so we don't need a DOM. When we
    // start testing React components, this becomes "jsdom" instead.
    environment: "node",

    // Only treat files ending in .test.ts / .test.tsx as tests.
    include: ["**/*.test.{ts,tsx}"],
  },
});
