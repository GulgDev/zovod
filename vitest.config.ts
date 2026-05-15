import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test-setup.ts"],
    clearMocks: true,
    globals: true, // needed for jest-when
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
