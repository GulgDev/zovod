import type { Snippet } from "svelte";

export const overlay = $state<{ current: Snippet | undefined }>({
  current: undefined,
});
