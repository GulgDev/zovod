<script lang="ts">
  import { ODD_COLUMN_Y_OFFSET, TILE_GAP, TILE_SIZE } from "./sizes";

  let { offsetX, offsetY }: { offsetX: number; offsetY: number } = $props();
</script>

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

<rect
  fill="url(#background-grid-pattern)"
  x={-offsetX}
  y={-offsetY}
  width="100%"
  height="100%"
/>
