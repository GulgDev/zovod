<script lang="ts">
  import type { Snippet } from "svelte";

  const { children, rect }: { children: Snippet; rect: DOMRectReadOnly } =
    $props();
</script>

<menu style:left="{rect.right}px" style:top="{rect.top}px">
  {@render children()}
</menu>

<style>
  menu {
    position: absolute;
  }
</style>
