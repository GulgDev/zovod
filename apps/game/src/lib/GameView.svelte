<script lang="ts">
  import type { FactoryMap } from "@zovod/engine";
  import FactoryMapView from "./factory-map/FactoryMapView.svelte";
  import {
    ODD_COLUMN_Y_OFFSET,
    TILE_GAP,
    TILE_SIZE,
    VIEWPORT_SIZE,
  } from "./factory-map/sizes";

  const { map }: { map: FactoryMap } = $props();

  // camera

  let viewportWidth = $state<number>(),
    viewportHeight = $state<number>();

  let offsetX = $state(0),
    offsetY = $state(0);

  // mouse events

  let isMouseDown = $state(false);

  // camera offset at the drag start
  let originOffsetX = $state<number>(),
    originOffsetY = $state<number>();

  // mouse position at the drag start
  let originMouseX = $state<number>(),
    originMouseY = $state<number>();
</script>

<svelte:document
  onmouseup={(): void => {
    isMouseDown = false;
  }}
/>

<svg
  width="100%"
  height="100%"
  bind:clientWidth={viewportWidth}
  bind:clientHeight={viewportHeight}
  viewBox="{-offsetX} {-offsetY} {VIEWPORT_SIZE} {VIEWPORT_SIZE}"
  preserveAspectRatio="xMinYMin slice"
  onmousedown={(ev): void => {
    isMouseDown = true;
    originMouseX = ev.clientX;
    originMouseY = ev.clientY;
    originOffsetX = offsetX;
    originOffsetY = offsetY;
  }}
  onmousemove={isMouseDown
    ? (ev): void => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        offsetX =
          originOffsetX! +
          ((ev.clientX - originMouseX!) /
            Math.max(viewportWidth!, viewportHeight!)) *
            VIEWPORT_SIZE;
        offsetY =
          originOffsetY! +
          ((ev.clientY - originMouseY!) /
            Math.max(viewportWidth!, viewportHeight!)) *
            VIEWPORT_SIZE;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      }
    : undefined}
>
  <defs>
    <use
      id="grid-tile-empty"
      href="{import.meta.env.BASE_URL}grid-tile.svg#grid-tile"
      style:--fill="none"
      style:--stroke="#f7eacd"
    />

    <pattern
      id="background-grid-pattern"
      x="0"
      y="0"
      width={(TILE_SIZE + TILE_GAP) * 2}
      height={TILE_SIZE + TILE_GAP}
      patternUnits="userSpaceOnUse"
    >
      <use href="#grid-tile-empty" x="0" y="0"></use>
      <use
        href="#grid-tile-empty"
        x={TILE_SIZE + TILE_GAP}
        y={ODD_COLUMN_Y_OFFSET - (TILE_SIZE + TILE_GAP)}
      ></use>
      <use
        href="#grid-tile-empty"
        x={TILE_SIZE + TILE_GAP}
        y={ODD_COLUMN_Y_OFFSET}
      ></use>
    </pattern>
  </defs>

  <!-- Background -->
  <rect
    fill="url(#background-grid-pattern)"
    x={-offsetX}
    y={-offsetY}
    width="100%"
    height="100%"
  />

  <FactoryMapView {map} />
</svg>

<style>
  svg {
    background-color: #fffbf2;
  }
</style>
