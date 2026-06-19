<script lang="ts">
  import type { FactoryMap } from "@zovod/engine";
  import { cubicOut } from "svelte/easing";
  import FactoryMapView from "./factory-map/FactoryMapView.svelte";
  import { VIEWPORT_SIZE } from "./factory-map/sizes";
  import Background from "./factory-map/Background.svelte";
  import { Camera } from "./camera.svelte";
  import { overlay } from "./overlay.svelte";
  import home from "../assets/controls/home.svg";
  import plus from "../assets/controls/plus.svg";
  import minus from "../assets/controls/minus.svg";

  const { map }: { map: FactoryMap } = $props();

  let svg = $state<SVGSVGElement>();

  // camera

  function screenToViewportPoint(x: number, y: number): DOMPointReadOnly {
    const screenCTM = svg?.getScreenCTM();
    if (!screenCTM)
      throw new Error("Viewport is not connected to the DOM yet.");
    return new DOMPointReadOnly(x, y).matrixTransform(screenCTM.inverse());
  }

  const MIN_SCALE = 0.4,
    MAX_SCALE = 1;

  const camera = new Camera(MIN_SCALE, MAX_SCALE, {
    duration: 200,
    easing: cubicOut,
  });

  // mouse events

  const SCALE_FACTOR = 1.1;

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
  onpointermove={(ev): void => {
    ({ x: mouseX, y: mouseY } = screenToViewportPoint(ev.clientX, ev.clientY));

    if (dragState) {
      camera.setOffset(
        camera.offsetX + dragState.x - mouseX,
        camera.offsetY + dragState.y - mouseY,
        { duration: 0 },
      );
    }
  }}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  bind:this={svg}
  width="100%"
  height="100%"
  viewBox="{camera.offsetX} {camera.offsetY} {VIEWPORT_SIZE /
    camera.scale} {VIEWPORT_SIZE / camera.scale}"
  preserveAspectRatio="xMinYMin slice"
  onpointerdown={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    dragState = { pointerId: ev.pointerId, x, y };
  }}
  onwheel={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    camera.zoom(camera.scale * SCALE_FACTOR ** Math.sign(-ev.deltaY), x, y, {
      duration: 0,
    });
  }}
>
  <Background offsetX={camera.offsetX} offsetY={camera.offsetY} />
  <FactoryMapView {map} {mouseX} {mouseY} />
</svg>

<div class="controls">
  <button
    onclick={(): void => {
      if (!svg) throw new Error("Viewport is not connected to the DOM yet.");

      const { x, y } = screenToViewportPoint(
        svg.clientLeft + svg.clientWidth / 2,
        svg.clientTop + svg.clientHeight / 2,
      );
      camera.zoom(camera.scale * SCALE_FACTOR, x, y);
    }}
    disabled={camera.targetScale === MAX_SCALE}
  >
    <img src={plus} alt="Приблизить" />
  </button>
  <button
    onclick={(): void => {
      camera.setTransform(0, 0, 1);
    }}
  >
    <img src={home} alt="В начало" />
  </button>
  <button
    onclick={(): void => {
      if (!svg) throw new Error("Viewport is not connected to the DOM yet.");

      const { x, y } = screenToViewportPoint(
        svg.clientLeft + svg.clientWidth / 2,
        svg.clientTop + svg.clientHeight / 2,
      );
      camera.zoom(camera.scale / SCALE_FACTOR, x, y);
    }}
    disabled={camera.targetScale === MIN_SCALE}
  >
    <img src={minus} alt="Отдалить" />
  </button>
</div>

{@render overlay.current?.()}

<style>
  svg {
    background-color: #fffbf2;

    user-select: none;
  }

  .controls {
    position: absolute;
    top: 50%;
    right: 32px;
    transform: translateY(-50%);

    display: flex;
    flex-direction: column;

    padding: 8px;
    gap: 10px;

    background-color: white;
    box-shadow: 0 5px 15px #906a3c3d;
    border-radius: 24px;

    user-select: none;
  }

  .controls button {
    display: flex; /* ignore font dimensions so that the buttons are square */

    background-color: #f7eacd;
    border: none;
    border-radius: 16px;
    padding: 8px;
  }

  .controls button:not(:disabled) {
    cursor: pointer;
  }

  .controls button:disabled {
    filter: brightness(0.95);
    opacity: 0.8;
  }
</style>
