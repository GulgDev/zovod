<script lang="ts">
  import {
    isFactoryUnitCell,
    type FactoryMap,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
  import FactoryUnitPlaceMenu from "./FactoryUnitPlaceMenu.svelte";
  import Portal from "../../util/Portal.svelte";
  import { overlay } from "../../overlay.svelte";

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

{#each factoryUnits as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay
    onremove={(): void => {
      map.removeUnitAt(x, y);
    }}
    {x}
    {y}
    {unit}
  />
{/each}
