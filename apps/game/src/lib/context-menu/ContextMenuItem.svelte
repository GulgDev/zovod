<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  const {
    children,
    ...props
  }: { children: Snippet } & HTMLAttributes<HTMLButtonElement> = $props();
</script>

<li>
  <button {...props}>
    {@render children()}
  </button>
</li>
