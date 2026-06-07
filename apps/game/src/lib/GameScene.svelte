<script lang="ts">
  // Sizes and offsets
  const TILE_SIZE = 1 / 8,
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

  // Border parameters
  const TILE_BORDER_SIZE = TILE_SIZE * 0.035,
    TILE_BORDER_RADIUS = TILE_SIZE * 0.07;
</script>

<svg
  width="100%"
  height="100%"
  viewBox="0 0 1 1"
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
        <!--
          SVG doesn't support inset borders, so we use a hack here: define a
          shape, and use it as its own clip path, doubling the stroke width.
        -->
        <rect
          id="grid-tile-shape"
          width={TILE_SIZE}
          height={TILE_SIZE}
          rx={TILE_BORDER_RADIUS}
          ry={TILE_BORDER_RADIUS}
        />
        <clipPath id="grid-tile-clip">
          <use href="#grid-tile-shape" />
        </clipPath>

        <use
          id="grid-tile"
          href="#grid-tile-shape"
          clip-path="url(#grid-tile-clip)"
          fill="transparent"
          stroke="hsla(41, 72%, 89%, 1)"
          stroke-width={TILE_BORDER_SIZE * 2}
        />
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
  <rect fill="hsla(42, 100%, 97%, 1)" width="100%" height="100%" />
  <rect fill="url(#background-grid-pattern)" width="100%" height="100%" />
</svg>
