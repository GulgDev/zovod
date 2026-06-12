import type { Snippet } from "svelte";

export const contextMenu = $state<{ current: Snippet | undefined }>({
  current: undefined,
});
