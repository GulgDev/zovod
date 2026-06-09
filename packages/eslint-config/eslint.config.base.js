// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig({
  extends: [
    js.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
  ],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
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
});
