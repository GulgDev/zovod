<script lang="ts">
  import {
    Market,
    ProductionPlant,
    Storage,
    type FactoryUnit,
  } from "@zovod/engine";
  import { ICON_SIZE, ODD_COLUMN_Y_OFFSET, TILE_GAP, TILE_SIZE } from "./sizes";

  const { x, y, unit }: { x: number; y: number; unit: FactoryUnit } = $props();

  // x, y are assumed to be in grid coordinate space, which also includes
  // non-unit cells
  const unitX = $derived(x / 2), // skip non-unit cells horizontally
    unitY = $derived((y - (x % 2) / 2) / 2); // skip non-grid cells vertically and offset every odd unit column by 1

  const left = $derived(unitX * (TILE_SIZE + TILE_GAP)),
    top = $derived(
      unitY * (TILE_SIZE + TILE_GAP) + ODD_COLUMN_Y_OFFSET * (x % 2),
    );

  const filter = $derived(
    `url(${import.meta.env.BASE_URL}filter-glow.svg#filter-glow-${
      unit.active ? "green" : "red"
    })`,
  );
</script>

<use
  x={left}
  y={top}
  href="{import.meta.env.BASE_URL}grid-tile.svg#grid-tile"
  {filter}
  style:--fill="#f7eacd"
  style:--stroke={unit.active ? "#d7e088" : "#ffbcaa"}
>
</use>

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
  href="{import.meta.env.BASE_URL}factory-unit/{unit instanceof ProductionPlant
    ? `production-plant/${unit.producedKind}`
    : unit instanceof Storage
      ? 'storage'
      : unit instanceof Market
        ? 'market'
        : ((): never => {
            throw new TypeError('Invalid factory unit type.');
          })()}-{unit.active ? 'green' : 'red'}.svg"
  {filter}
/>
