<script lang="ts">
  import FactoryUnitTile from "./factory-units/FactoryUnitTile.svelte";
  import { TILE_GAP, TILE_SIZE } from "./sizes";

  let { offsetX, offsetY }: { offsetX: number; offsetY: number } = $props();
</script>

<defs>
  <pattern
    id="background-grid-pattern"
    x="0"
    y="0"
    width={(TILE_SIZE + TILE_GAP) * 2}
    height={TILE_SIZE + TILE_GAP}
    patternUnits="userSpaceOnUse"
  >
    <FactoryUnitTile x={0} y={0} stroke="#f7eacd" />
    <FactoryUnitTile x={2} y={-1} stroke="#f7eacd" />
    <FactoryUnitTile x={2} y={1} stroke="#f7eacd" />
  </pattern>
</defs>

<rect
  fill="url(#background-grid-pattern)"
  x={-offsetX}
  y={-offsetY}
  width="100%"
  height="100%"
/>
