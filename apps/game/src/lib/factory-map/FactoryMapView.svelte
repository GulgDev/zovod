<script lang="ts">
  import { isFactoryUnitCell, type FactoryMap } from "@zovod/engine";
  import FactoryUnits from "./factory-units/FactoryUnits.svelte";
  import FactoryFlows from "./flows/FactoryFlows.svelte";
  import { ODD_COLUMN_Y_OFFSET, TILE_GAP, TILE_SIZE } from "./sizes";
  import { floorDiv, floorMod } from "../math";
  import FactoryUnitTile from "./factory-units/FactoryUnitTile.svelte";

  const {
    map,
    // mouse position in viewport coordinate space
    mouseX,
    mouseY,
  }: { map: FactoryMap; mouseX: number; mouseY: number } = $props();

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

<FactoryUnits {map} />
<FactoryFlows {map} />

{#if isFactoryUnitCell(tileColumn, tileRow) && !map.getUnitAt(tileColumn, tileRow)}
  <FactoryUnitTile
    x={tileColumn}
    y={tileRow}
    icon="{import.meta.env.BASE_URL}factory-unit/place.svg"
    style="cursor: pointer;"
  />
{/if}
