<script lang="ts">
  const TILE_SIZE = 1,
    TILE_GAP = 0.45;

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
  viewBox="0 0 {8 * TILE_SIZE} {8 * TILE_SIZE}"
  preserveAspectRatio="xMinYMin slice"
>
  <defs>
    <pattern
      id="background-grid-pattern"
      x="0"
      y="0"
      width={(TILE_SIZE + TILE_GAP) * 2}
      height={TILE_SIZE + TILE_GAP}
      patternUnits="userSpaceOnUse"
    >
      <defs>
        <rect id="grid-tile" width={TILE_SIZE} height={TILE_SIZE} fill="red" />
      </defs>

      <use href="#grid-tile" x="0" y="0"></use>
      <use
        href="#grid-tile"
        x={TILE_SIZE + TILE_GAP}
        y={ODD_COLUMN_Y_OFFSET - (TILE_SIZE + TILE_GAP)}
      ></use>
      <use href="#grid-tile" x={TILE_SIZE + TILE_GAP} y={ODD_COLUMN_Y_OFFSET}
      ></use>
    </pattern>
  </defs>

  <!-- Background -->
  <rect fill="url(#background-grid-pattern)" width="100%" height="100%" />
</svg>
