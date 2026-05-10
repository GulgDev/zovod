import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test-setup.ts"],
    clearMocks: true,
    projects: [
      {
        extends: true,
        test: {
          include: ["packages/*/test/**/*.spec.{ts,js}"],
        },
      },
    ],
  },
});
