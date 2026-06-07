import svelteConfig from "./svelte.config.js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import base from "@zovod/eslint-config/base";

export default defineConfig(
  base,
  svelte.configs.recommended,
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      // enforce TypeScript in Svelte files
      "svelte/block-lang": ["error", { script: "ts" }],
    },
  },
);
