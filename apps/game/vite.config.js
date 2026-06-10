import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [svelte(), legacy()],
  base: process.env.VITE_BASE_PATH?.replace(/(?<!\/)$/, "/"), // add trailing slash
});
