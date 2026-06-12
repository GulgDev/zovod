<script lang="ts">
  import {
    isFactoryUnitCell,
    type FactoryMap,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
  import ContextMenu from "../../context-menu/ContextMenu.svelte";
  import ContextMenuItem from "../../context-menu/ContextMenuItem.svelte";
  import Portal from "../../util/Portal.svelte";
  import { contextMenu } from "../../context-menu.svelte";

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

  let menuOpen = $state(false),
    menuRect = $state<DOMRect>();
</script>

{#key factoryUnits}
  {#if isFactoryUnitCell(tileColumn, tileRow) && !map.getUnitAt(tileColumn, tileRow)}
    <FactoryUnitTile
      x={tileColumn}
      y={tileRow}
      icon="{import.meta.env.BASE_URL}factory-unit/place.svg"
      style="cursor: pointer;"
      onclick={(ev): void => {
        menuOpen = true;
        menuRect = ev.currentTarget.getBoundingClientRect();
      }}
    />
  {/if}
{/key}

<Portal bind:target={contextMenu.current}>
  <ContextMenu bind:open={menuOpen} rect={menuRect}>
    <ContextMenuItem>Menu item</ContextMenuItem>
  </ContextMenu>
</Portal>

{#each factoryUnits as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay {x} {y} {unit} />
{/each}
