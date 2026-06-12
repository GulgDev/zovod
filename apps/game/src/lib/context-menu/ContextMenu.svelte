<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    open = $bindable(),
    rect,
  }: { children: Snippet; open: boolean; rect?: DOMRectReadOnly } = $props();

  const closeCallback = $derived(
    open
      ? (): void => {
          open = false;
        }
      : undefined,
  );
</script>

<svelte:window onblur={closeCallback} onwheel={closeCallback} />

<svelte:document
  onkeydown={open
    ? (ev): void => {
        if (ev.key === "Escape") {
          open = false;
        }
      }
    : undefined}
/>

{#if open}
  <menu
    style:left={rect && `${rect.right}px`}
    style:top={rect && `${rect.top}px`}
    onblur={closeCallback}
  >
    {@render children()}
  </menu>
{/if}

<style>
  menu {
    position: absolute;
  }
</style>
