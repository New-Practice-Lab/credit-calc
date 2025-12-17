import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Use happy-dom for faster DOM testing
    environment: "happy-dom",

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        "src/js/factgraph-opt.js", // Exclude large compiled dependency
        "src/js/factgraph-opt.js.map",
        "**/*.config.js",
      ],
      include: ["src/js/credit-calc-loader.js", "src/js/credit-calc-utils.js"],
      // High thresholds for tax calculation code
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },

    // Test timeout for async Fact Graph operations)
    testTimeout: 10000,

    // Globals (makes describe/it/expect available without imports)
    globals: true,

    // Parallel execution
    threads: true,

    // Reporter
    reporters: ["verbose"],
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
    },
  },
});
