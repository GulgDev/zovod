import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import base from "@zovod/eslint-config/base";

export default defineConfig({
  files: ["src/**/*.ts"],
  extends: [base],
});
