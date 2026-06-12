<script lang="ts">
  import Portal from "../../util/Portal.svelte";
  import { overlay } from "../../overlay.svelte";

  let { open = $bindable() }: { open: boolean } = $props();

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    // FIXME: Is this a hack?
    if (open) dialog?.showModal();
    else dialog?.close();
  });

  const closeCallback = $derived(
    open
      ? (): void => {
          open = false;
        }
      : undefined,
  );
</script>

<svelte:window onpointerdown={closeCallback} />

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
  <Portal bind:target={overlay.current}>
    <dialog
      bind:this={dialog}
      onpointerdown={(ev): void => {
        ev.stopPropagation();
      }}
    >
      Hello world!
    </dialog>
  </Portal>
{/if}

<style>
  dialog {
    background-color: #fffbf2;
    border: 1px solid #ddd1b7;
    border-radius: 16px;
  }

  dialog::backdrop {
    background-color: #8e7556;
    opacity: 0.4;
    backdrop-filter: blur(8px);
  }
</style>
