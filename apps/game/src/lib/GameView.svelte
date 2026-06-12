<script lang="ts">
  import type { FactoryMap } from "@zovod/engine";
  import FactoryMapView from "./factory-map/FactoryMapView.svelte";
  import { VIEWPORT_SIZE } from "./factory-map/sizes";
  import Background from "./factory-map/Background.svelte";
  import { overlay } from "./overlay.svelte";

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

  // mouse position in viewport coordinate space
  let mouseX = $state(0),
    mouseY = $state(0);

  let dragState = $state<{
    pointerId: number;
    // camera offset at the drag start
    x: number;
    y: number;
  }>();
</script>

<svelte:document
  onpointerup={(ev): void => {
    if (ev.pointerId === dragState?.pointerId) dragState = undefined;
  }}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  bind:this={svg}
  width="100%"
  height="100%"
  viewBox="{offsetX} {offsetY} {VIEWPORT_SIZE / scale} {VIEWPORT_SIZE / scale}"
  preserveAspectRatio="xMinYMin slice"
  onpointerdown={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    dragState = { pointerId: ev.pointerId, x, y };
  }}
  onpointermove={(ev): void => {
    ({ x: mouseX, y: mouseY } = screenToViewportPoint(ev.clientX, ev.clientY));

    if (dragState) {
      offsetX += dragState.x - mouseX;
      offsetY += dragState.y - mouseY;
    }
  }}
  onwheel={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    const newScale = Math.max(
      Math.min(scale * SCALE_FACTOR ** Math.sign(-ev.deltaY), MAX_SCALE),
      MIN_SCALE,
    );
    offsetX = x - (x - offsetX) * (scale / newScale);
    offsetY = y - (y - offsetY) * (scale / newScale);
    scale = newScale;
  }}
>
  <Background {offsetX} {offsetY} />
  <FactoryMapView {map} {mouseX} {mouseY} />
</svg>

{@render overlay.current?.()}

<style>
  svg {
    background-color: #fffbf2;
  }
</style>
