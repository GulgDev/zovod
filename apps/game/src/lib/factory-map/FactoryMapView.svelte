<script lang="ts">
  import {
    isFactoryUnitCell,
    type FactoryMap,
    type FactoryUnit,
  } from "@zovod/engine";
  import { directionFrom, type Direction } from "./direction";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";
  import FlowEdge from "./FlowEdge.svelte";
  import { ICON_SIZE, ODD_COLUMN_Y_OFFSET, TILE_GAP, TILE_SIZE } from "./sizes";
  import { floorDiv, floorMod } from "../math";

  const {
    map,
    // mouse position in viewport coordinate space
    mouseX,
    mouseY,
  }: { map: FactoryMap; mouseX: number; mouseY: number } = $props();

  let factoryUnits = $state<[readonly [number, number], FactoryUnit][]>();

  function updateFactoryUnits(): void {
    factoryUnits = Array.from(map.getAllUnitsWithCoords());
  }

  $effect(() => {
    map.addEventListener("unitchange", updateFactoryUnits);
    updateFactoryUnits();
  });

  let flowEdges = $state<
    { x: number; y: number; from: Direction; to: Direction }[]
  >([]);

  function updateFlowEdges(): void {
    flowEdges = Array.from(map.getAllFlowEdges()).flatMap(
      ([[x1, y1], [x2, y2]]) =>
        map.getFlowNodeTargets(x2, y2).map(([x3, y3]) => ({
          x: x2,
          y: y2,
          from: directionFrom(x2, y2, x1, y1),
          to: directionFrom(x2, y2, x3, y3),
        })),
    );
  }

  $effect(() => {
    map.addEventListener("flowchange", updateFlowEdges);
    updateFlowEdges();
  });

  // Convert viewport coordinates to tile coordinates, where the integer part
  // is the cell index (column and row), and the fractional part is the
  // normalized position within that cell

  // Grid follows a periodical pattern:
  // #  .  .  .  #  .  .  .
  // .  .  #  .  .  .  #  .
  // #  .  .  .  #  .  .  .
  // .  .  #  .  .  .  #  .
  // where # are factory unit tiles of size TILE_SIZE x TILE_SIZE and . are flow
  // tiles TILE_SIZE x TILE_GAP or, depending on whether it's in even or an odd
  // column, TILE_GAP x (TILE_SIZE + TILE_GAP) / 2
  const PERIOD_HORIZONTAL = TILE_SIZE + TILE_GAP,
    PERIOD_VERTICAL = TILE_SIZE + TILE_GAP;

  const mouseXMod = $derived(floorMod(mouseX, PERIOD_HORIZONTAL)),
    mouseYMod = $derived(
      floorMod(
        mouseY +
          ODD_COLUMN_Y_OFFSET *
            floorMod(floorDiv(mouseX, PERIOD_HORIZONTAL), 2),
        PERIOD_VERTICAL,
      ),
    ); // mouseYMod is only valid for odd columns

  const tileX = $derived(
      2 * floorDiv(mouseX, PERIOD_HORIZONTAL) +
        (mouseXMod <= TILE_SIZE
          ? mouseXMod / TILE_SIZE
          : 1 + (mouseXMod - TILE_SIZE) / TILE_GAP),
    ),
    tileY = $derived(
      mouseXMod <= TILE_SIZE
        ? -floorMod(floorDiv(mouseX, PERIOD_HORIZONTAL), 2) +
            2 *
              floorDiv(
                mouseY +
                  ODD_COLUMN_Y_OFFSET *
                    floorMod(floorDiv(mouseX, PERIOD_HORIZONTAL), 2),
                PERIOD_VERTICAL,
              ) +
            (mouseYMod <= TILE_SIZE
              ? mouseYMod / TILE_SIZE
              : 1 + (mouseYMod - TILE_SIZE) / TILE_GAP)
        : (mouseY - (TILE_SIZE - TILE_GAP) / 4) / ((TILE_SIZE + TILE_GAP) / 2),
    );

  const tileColumn = $derived(Math.floor(tileX)),
    tileRow = $derived(Math.floor(tileY));
</script>

{#each factoryUnits as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay {x} {y} {unit} />
{/each}

{#each flowEdges as edge ((edge.y << 16) | (edge.x & 0xffff))}
  <FlowEdge {...edge} />
{/each}

{#if isFactoryUnitCell(tileColumn, tileRow) && !map.getUnitAt(tileColumn, tileRow)}
  <image
    x={(tileColumn / 2) * (TILE_SIZE + TILE_GAP) +
      TILE_SIZE / 2 -
      ICON_SIZE / 2}
    y={(tileRow / 2) * (TILE_SIZE + TILE_GAP) +
      ODD_COLUMN_Y_OFFSET * (tileColumn % 2) +
      TILE_SIZE / 2 -
      ICON_SIZE / 2}
    width={ICON_SIZE}
    height={ICON_SIZE}
    // see FactoryUnitDisplay.svelte for preserveAspectRation
    preserveAspectRatio="none"
    href="{import.meta.env.BASE_URL}factory-unit/place.svg"
  />

  <!-- TODO: replace this hack -->
  <rect
    x={(tileColumn / 2) * (TILE_SIZE + TILE_GAP)}
    y={(tileRow / 2) * (TILE_SIZE + TILE_GAP) +
      ODD_COLUMN_Y_OFFSET * (tileColumn % 2)}
    width={TILE_SIZE}
    height={TILE_SIZE}
    fill="transparent"
    style:cursor="pointer"
  />
{/if}
