<script lang="ts">
  import {
    isFactoryUnitCell,
    Market,
    type FactoryMap,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";
  import MarketDisplay from "./MarketDisplay.svelte";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
  import FactoryUnitPlaceMenu from "./FactoryUnitPlaceMenu.svelte";
  import Portal from "../../util/Portal.svelte";
  import { overlay } from "../../overlay.svelte";
  import { factoryUnitTypes } from "../../economy/factory-unit-types";
  import { game } from "../../game.svelte";

  const {
    map,
    tileColumn,
    tileRow,
  }: { map: FactoryMap; tileColumn: number; tileRow: number } = $props();

  let factoryUnits = $state<[readonly [number, number], FactoryUnit][]>();

  function updateFactoryUnits(): void {
    factoryUnits = Array.from(map.getAllUnitsWithCoords());
  }

  $effect(() => {
    map.addEventListener("unitchange", updateFactoryUnits);
    updateFactoryUnits();
  });

  let placeMenuState = $state<{
    left: number;
    top: number;
    targetX: number;
    targetY: number;
  }>();
</script>

{#key factoryUnits}
  {#if isFactoryUnitCell(tileColumn, tileRow) && !map.getUnitAt(tileColumn, tileRow)}
    <FactoryUnitTile
      x={tileColumn}
      y={tileRow}
      icon="{import.meta.env.BASE_URL}factory-unit/place.svg"
      style="cursor: pointer;"
      onclick={(ev): void => {
        const rect = ev.currentTarget.getBoundingClientRect();
        placeMenuState = {
          left: rect.right,
          top: rect.top,
          targetX: tileColumn,
          targetY: tileRow,
        };
      }}
    />
  {/if}
{/key}

{#if placeMenuState}
  <Portal bind:target={overlay.current}>
    <FactoryUnitPlaceMenu
      bind:open={
        (): boolean => placeMenuState !== undefined,
        (open): void => {
          if (!open) placeMenuState = undefined;
        }
      }
      left={placeMenuState.left}
      top={placeMenuState.top}
      onplace={(unit): void => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map.placeUnit(unit, placeMenuState!.targetX, placeMenuState!.targetY);
      }}
    />
  </Portal>
{/if}

{#each factoryUnits?.filter(([, unit]) => !(unit instanceof Market)) as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay
    onremove={(): void => {
      const info = factoryUnitTypes.find((type) => type.is(unit));
      if (info && info.price) game.inventory.earnMoney(info.price.sell);
      map.removeUnitAt(x, y);
    }}
    {x}
    {y}
    {unit}
  />
{/each}

<MarketDisplay />
