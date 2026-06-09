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

  const pxPerViewportUnit = $derived(
    viewportWidth !== undefined && viewportHeight !== undefined
      ? Math.max(viewportWidth, viewportHeight) / VIEWPORT_SIZE
      : undefined,
  );

  let offsetX = $state(0),
    offsetY = $state(0);
  let scale = $state(1);

  // mouse events

  const SCALE_FACTOR = 1.1;

  const MIN_SCALE = 0.4,
    MAX_SCALE = 1;

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  width="100%"
  height="100%"
  bind:clientWidth={viewportWidth}
  bind:clientHeight={viewportHeight}
  viewBox="{-offsetX} {-offsetY} {VIEWPORT_SIZE / scale} {VIEWPORT_SIZE /
    scale}"
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
          (ev.clientX - originMouseX!) / pxPerViewportUnit! / scale;
        offsetY =
          originOffsetY! +
          (ev.clientY - originMouseY!) / pxPerViewportUnit! / scale;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      }
    : undefined}
  onwheel={(ev): void => {
    const newScale = Math.max(
      Math.min(scale * SCALE_FACTOR ** Math.sign(-ev.deltaY), MAX_SCALE),
      MIN_SCALE,
    );
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    offsetX += (ev.clientX / pxPerViewportUnit!) * (1 / newScale - 1 / scale);
    offsetY += (ev.clientY / pxPerViewportUnit!) * (1 / newScale - 1 / scale);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    scale = newScale;
  }}
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
