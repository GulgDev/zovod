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
      id="grid-tile-empty"
      href="#grid-tile-shape"
      clip-path="url(#grid-tile-clip)"
      fill="transparent"
      stroke="#f7eacd"
      stroke-width={TILE_BORDER_SIZE * 2}
    />

    <filter id="glow">
      <!-- inner shadow -->
      <feGaussianBlur stdDeviation={TILE_SIZE * 0.1} result="offset-blur" />
      <feComposite
        operator="out"
        in="SourceGraphic"
        in2="offset-blur"
        result="inverse"
      />
      <feFlood flood-color="#d7e088" result="color" />
      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
      <feComposite operator="over" in="shadow" in2="SourceGraphic" />

      <feDropShadow
        dx="0"
        dy="0"
        stdDeviation={TILE_SIZE * 0.04}
        flood-color="#d7e088"
        flood-opacity="0.6"
      />
    </filter>

    <use
      id="grid-tile"
      href="#grid-tile-shape"
      clip-path="url(#grid-tile-clip)"
      stroke-width={TILE_BORDER_SIZE * 2}
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
  <use href="#grid-tile" filter="url(#glow)" />
</svg>

<style>
  #grid-tile {
    fill: #f7eacd;
    stroke: #d7e088 /* #f0d8aa */;
    box-shadow: 0 0 6.5px #d7e088;
  }
</style>
