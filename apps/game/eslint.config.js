import svelteConfig from "./svelte.config.js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import base from "@zovod/eslint-config/base";

export default defineConfig({
  files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
  extends: [base, svelte.configs.recommended],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      projectService: true,
      extraFileExtensions: [".svelte"],
      parser: tseslint.parser,
      svelteConfig,
    },
  },
  rules: {
    // enforce TypeScript in Svelte files
    "svelte/block-lang": ["error", { script: "ts" }],
  },
});
