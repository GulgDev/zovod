<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { ICON_SIZE, TILE_GAP, TILE_SIZE } from "../sizes";

  const {
    x,
    y,
    fill = "transparent",
    stroke = "none",
    icon,
    ...props
  }: {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    icon?: string;
  } & SVGAttributes<SVGImageElement | SVGUseElement> = $props();
</script>

{const left = (x / 2) * (TILE_SIZE + TILE_GAP),
  top = (y / 2) * (TILE_SIZE + TILE_GAP)}

<use
  x={left}
  y={top}
  href="{import.meta.env.BASE_URL}grid-tile.svg#grid-tile"
  style:--fill={fill}
  style:--stroke={stroke}
  {...props}
/>

{#if icon}
  <image
    x={left + TILE_SIZE / 2 - ICON_SIZE / 2}
    y={top + TILE_SIZE / 2 - ICON_SIZE / 2}
    width={ICON_SIZE}
    height={ICON_SIZE}
    // due to a bug in Chromium, SVG image elements with width or height less than
    // 0.5 are rounded to 0 and are treated as empty
    // (https://github.com/chromium/chromium/blob/c7197fb1a360d90945837c820d2fd9bece423519/third_party/blink/renderer/core/paint/svg_image_painter.cc#L97)
    // so use this as a workaround:
    // (https://github.com/chromium/chromium/blob/c7197fb1a360d90945837c820d2fd9bece423519/third_party/blink/renderer/core/paint/svg_image_painter.cc#L162)
    preserveAspectRatio="none"
    href={icon}
    {...props}
  />
{/if}
