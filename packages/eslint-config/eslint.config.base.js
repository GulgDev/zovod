// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      // declaration merging is useful for typing EventTarget
      "@typescript-eslint/no-unsafe-declaration-merging": "off",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: false },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
);
