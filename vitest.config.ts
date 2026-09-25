import {defineConfig} from "vitest/config";
import path from "path";

export default defineConfig({
  test: { 
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false // avoid parallel SQLite connections to the same db
  },
  resolve: {
    alias: {"@": path.resolve(__dirname, "./src")},
  },
});