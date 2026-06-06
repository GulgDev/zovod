import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import base from "@zovod/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default defineConfig(
  tseslint.config({
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }),
  base,
);
