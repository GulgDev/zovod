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

  let svg = $state<SVGSVGElement>();

  // camera

  function screenToViewportPoint(x: number, y: number): DOMPointReadOnly {
    const screenCTM = svg?.getScreenCTM();
    if (!screenCTM)
      throw new Error("Viewport is not connected to the DOM yet.");
    return new DOMPointReadOnly(x, y).matrixTransform(screenCTM.inverse());
  }

  let offsetX = $state(0),
    offsetY = $state(0);
  let scale = $state(1);

  // mouse events

  const SCALE_FACTOR = 1.1;

  const MIN_SCALE = 0.4,
    MAX_SCALE = 1;

  let dragState = $state<
    | { dragging: false; dragX?: undefined; dragY?: undefined }
    | {
        dragging: true;
        // camera offset at the drag start
        dragX: number;
        dragY: number;
      }
  >({
    dragging: false,
  });
  const { dragging, dragX, dragY } = $derived(dragState);
</script>

<svelte:document
  onmouseup={(): void => {
    dragState = { dragging: false };
  }}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  bind:this={svg}
  width="100%"
  height="100%"
  viewBox="{-offsetX} {-offsetY} {VIEWPORT_SIZE / scale} {VIEWPORT_SIZE /
    scale}"
  preserveAspectRatio="xMinYMin slice"
  onmousedown={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    dragState = { dragging: true, dragX: x, dragY: y };
  }}
  onmousemove={(ev): void => {
    if (dragging) {
      const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
      offsetX += x - dragX;
      offsetY += y - dragY;
    }
  }}
  onwheel={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    const newScale = Math.max(
      Math.min(scale * SCALE_FACTOR ** Math.sign(-ev.deltaY), MAX_SCALE),
      MIN_SCALE,
    );
    offsetX += (x + offsetX) * (scale / newScale - 1);
    offsetY += (y + offsetY) * (scale / newScale - 1);
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
