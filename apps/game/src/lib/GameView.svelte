<script lang="ts">
  import type { FactoryMap } from "@zovod/engine";
  import { Tween, type TweenOptions } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import FactoryMapView from "./factory-map/FactoryMapView.svelte";
  import { VIEWPORT_SIZE } from "./factory-map/sizes";
  import Background from "./factory-map/Background.svelte";
  import { overlay } from "./overlay.svelte";
  import home from "../assets/camera-controls/home.svg";
  import zoomIn from "../assets/camera-controls/zoom-in.svg";
  import zoomOut from "../assets/camera-controls/zoom-out.svg";

  const { map }: { map: FactoryMap } = $props();

  let svg = $state<SVGSVGElement>();

  // camera

  function screenToViewportPoint(x: number, y: number): DOMPointReadOnly {
    const screenCTM = svg?.getScreenCTM();
    if (!screenCTM)
      throw new Error("Viewport is not connected to the DOM yet.");
    return new DOMPointReadOnly(x, y).matrixTransform(screenCTM.inverse());
  }

  const tweenOptions: TweenOptions<number> = {
    duration: 200,
    easing: cubicOut,
  };

  let offsetX = new Tween(0, tweenOptions),
    offsetY = new Tween(0, tweenOptions);
  let scale = new Tween(1, tweenOptions);

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
  viewBox="{offsetX.current} {offsetY.current} {VIEWPORT_SIZE /
    scale.current} {VIEWPORT_SIZE / scale.current}"
  preserveAspectRatio="xMinYMin slice"
  onpointerdown={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    dragState = { pointerId: ev.pointerId, x, y };
  }}
  onpointermove={(ev): void => {
    ({ x: mouseX, y: mouseY } = screenToViewportPoint(ev.clientX, ev.clientY));

    if (dragState) {
      offsetX.set(offsetX.current + dragState.x - mouseX, { duration: 0 });
      offsetY.set(offsetY.current + dragState.y - mouseY, { duration: 0 });
    }
  }}
  onwheel={(ev): void => {
    const { x, y } = screenToViewportPoint(ev.clientX, ev.clientY);
    const newScale = Math.max(
      Math.min(
        scale.current * SCALE_FACTOR ** Math.sign(-ev.deltaY),
        MAX_SCALE,
      ),
      MIN_SCALE,
    );
    offsetX.set(x - (x - offsetX.current) * (scale.current / newScale), {
      duration: 0,
    });
    offsetY.set(y - (y - offsetY.current) * (scale.current / newScale), {
      duration: 0,
    });
    scale.set(newScale, { duration: 0 });
  }}
>
  <Background offsetX={offsetX.current} offsetY={offsetY.current} />
  <FactoryMapView {map} {mouseX} {mouseY} />
</svg>

<div class="controls">
  <button
    onclick={(): void => {
      scale.target = Math.min(scale.current * SCALE_FACTOR, MAX_SCALE);
    }}
    disabled={scale.target === MAX_SCALE}
  >
    <img src={zoomIn} alt="Приблизить" />
  </button>
  <button
    onclick={(): void => {
      offsetX.target = 0;
      offsetY.target = 0;
      scale.target = 1;
    }}
  >
    <img src={home} alt="В начало" />
  </button>
  <button
    onclick={(): void => {
      scale.target = Math.max(scale.current / SCALE_FACTOR, MIN_SCALE);
    }}
    disabled={scale.target === MIN_SCALE}
  >
    <img src={zoomOut} alt="Отдалить" />
  </button>
</div>

{@render overlay.current?.()}

<style>
  svg {
    background-color: #fffbf2;
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
  }

  .controls button {
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
