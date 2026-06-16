<script lang="ts">
  let { values = $bindable() }: { values: number[] } = $props();

  const offsets = $derived(
    values.reduce<number[]>(
      (acc, val) => [...acc, (acc.at(-1) ?? 0) + val],
      [],
    ),
  );
  let slider = $state<HTMLDivElement>();

  let dragState = $state<{ pointerId: number; index: number }>();
</script>

<svelte:document
  onpointerup={dragState
    ? (ev): void => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (ev.pointerId === dragState!.pointerId) dragState = undefined;
      }
    : undefined}
  onpointermove={dragState
    ? (ev): void => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { pointerId, index: i } = dragState!;

        if (!slider) throw new Error("Slider is not mounted to the DOM.");

        if (ev.pointerId !== pointerId) return;

        const rect = slider.getBoundingClientRect();
        const position = Math.min(
          Math.max((ev.clientX - rect.left) / rect.width, offsets[i - 1] ?? 0),
          offsets[i + 1] ?? 1,
        );

        const newValue = position - (values[i - 1] ?? 0);
        values = values
          .with(i, newValue)
          .with(i + 1, values[i + 1] + values[i] - newValue);
      }
    : undefined}
/>

<div bind:this={slider} class="slider">
  {#each values as value, index (index)}
    <div
      class="part"
      style:--index={index / (values.length - 1)}
      style:--value={value}
    >
      {#if index < values.length - 1}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span
          class="thumb"
          onpointerdown={(ev): void => {
            dragState = { pointerId: ev.pointerId, index };
          }}
        ></span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .slider {
    display: flex;
    justify-content: space-between;

    height: 16px;
    border-radius: 16px;
    overflow: clip;

    user-select: none; /* prevents text selection when dragging the slider */
  }

  .part {
    display: inline-block;
    flex: calc(var(--value) * 100%);

    background-color: color-mix(
      in srgb,
      #f0d8aa,
      #563414 calc(var(--index) * 100%)
    );
  }

  .thumb {
    display: block;
    width: 2px;
    height: 100%;
    float: right;

    background-color: black;

    cursor: ew-resize;
  }
</style>
