<script lang="ts">
  import FactoryUnit from "./FactoryUnit.svelte";

  // Sizes and offsets
  const TILE_SIZE = 1,
    TILE_GAP = TILE_SIZE * 0.45;

  // Offset odd columns vertically so that the gaps connect the centers of
  // surrounding tiles:
  // ######  ######
  //         ######
  // ######  ######
  // ######
  // ######  ######
  //         ######
  // ######  ######
  const ODD_COLUMN_Y_OFFSET = (TILE_SIZE + TILE_GAP) / 2;
</script>

<svg
  width="100%"
  height="100%"
  viewBox="0 0 8 8"
  preserveAspectRatio="xMinYMin slice"
>
  <defs>
    <use
      id="grid-tile-empty"
      href="{import.meta.env.BASE_URL}grid-tile.svg#grid-tile"
      style:--fill="transparent"
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
  <rect fill="#fffbf2" width="100%" height="100%" />
  <rect fill="url(#background-grid-pattern)" width="100%" height="100%" />

  <!-- Units -->
  <FactoryUnit x={0} y={0} unit={{ active: false } as any} />
  <use href="#grid-tile" filter="url(#glow)" />
</svg>
