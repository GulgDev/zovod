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
      closedby="any"
      onpointerdown={(ev): void => {
        ev.stopPropagation();
      }}
      onclose={(): void => {
        open = false;
      }}
    >
      <div class="header">
        <FactoryUnitStatusIcon active={unit.active} />
        <span>Прядильный отдел</span>

        <button
          class="close-button"
          title="Закрыть"
          onclick={(): void => {
            open = false;
          }}
        >
          <img src={close} alt="Закрыть" height="8" />
        </button>
      </div>
    </dialog>
  </Portal>
{/if}

<style>
  dialog {
    width: 540px;
    height: 500px;
    max-width: calc(100% - 24px * 2);
    max-height: calc(100% - 24px * 2);
    box-sizing: border-box;

    padding: 20px 32px;

    background-color: #fffbf2;
    border: 1px solid #ddd1b7;
    border-radius: 16px;
  }

  dialog::backdrop {
    background-color: #8e7556;
    opacity: 0.4;
    backdrop-filter: blur(8px);
  }

  .close-button {
    float: right;

    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
</style>
