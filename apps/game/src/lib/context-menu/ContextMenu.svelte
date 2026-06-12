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
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <menu
    style:left={rect && `${rect.right}px`}
    style:top={rect && `${rect.top}px`}
    onclick={(ev): void => {
      if (ev.target instanceof Element && ev.target.closest("button")) {
        open = false;
      }
    }}
    onblur={closeCallback}
  >
    {@render children()}
  </menu>
{/if}

<style>
  menu {
    position: absolute;

    display: flex;
    flex-direction: column;

    list-style-type: none;
    margin: 0;
    margin-left: 16px;
    padding: 0;

    user-select: none;

    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 5.9px #906a3c3d;
    overflow: hidden;
  }
</style>
