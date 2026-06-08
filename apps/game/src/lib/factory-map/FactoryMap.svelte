<script lang="ts">
  import { DIRECTION } from "./direction";
  import FactoryUnit from "./FactoryUnit.svelte";
  import FlowEdge from "./FlowEdge.svelte";
  import { ODD_COLUMN_Y_OFFSET, TILE_GAP, TILE_SIZE } from "./sizes";
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
  <FactoryUnit x={2} y={1} unit={{ active: true } as any} />
  <FactoryUnit x={4} y={0} unit={{ active: false } as any} />
  <FactoryUnit x={0} y={2} unit={{ active: true } as any} />
  <FactoryUnit x={2} y={3} unit={{ active: false } as any} />
  <FactoryUnit x={4} y={2} unit={{ active: true } as any} />
  <FlowEdge x={0} y={1} from={DIRECTION.S} to={DIRECTION.E} />
  <FlowEdge x={1} y={1} from={DIRECTION.W} to={DIRECTION.N} />
  <FlowEdge x={1} y={0} from={DIRECTION.S} to={DIRECTION.W} />
</svg>
