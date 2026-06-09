<script lang="ts">
  import { type FactoryUnit } from "@zovod/engine";
  import { ODD_COLUMN_Y_OFFSET, TILE_GAP, TILE_SIZE } from "./sizes";

  const { x, y, unit }: { x: number; y: number; unit: FactoryUnit } = $props();

  // x, y are assumed to be in grid coordinate space, which also includes
  // non-unit cells
  const unitX = $derived(x / 2), // skip non-unit cells horizontally
    unitY = $derived((y - (x % 2) / 2) / 2); // skip non-grid cells vertically and offset every odd unit column by 1
</script>

<use
  x={unitX * (TILE_SIZE + TILE_GAP)}
  y={unitY * (TILE_SIZE + TILE_GAP) + ODD_COLUMN_Y_OFFSET * (x % 2)}
  href="{import.meta.env.BASE_URL}grid-tile.svg#grid-tile"
  filter="url({import.meta.env.BASE_URL}filter-glow.svg#filter-glow-{unit.active
    ? 'green'
    : 'red'})"
  style:--fill="#f7eacd"
  style:--stroke={unit.active ? "#d7e088" : "#ffbcaa"}
/>
