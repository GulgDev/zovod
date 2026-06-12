<script lang="ts">
  import {
    isFactoryUnitCell,
    type FactoryMap,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
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

  let menuRect = $state<DOMRect>();
</script>

<svelte:document
  onmousedown={(): void => {
    menuRect = undefined;
  }}
/>

{#key factoryUnits}
  {#if isFactoryUnitCell(tileColumn, tileRow) && !map.getUnitAt(tileColumn, tileRow)}
    <FactoryUnitTile
      x={tileColumn}
      y={tileRow}
      icon="{import.meta.env.BASE_URL}factory-unit/place.svg"
      style="cursor: pointer;"
      onclick={(ev): void => {
        menuRect = ev.currentTarget.getBoundingClientRect();
      }}
    />
  {/if}
{/key}

{#if menuRect}
  <Portal bind:target={contextMenu.current}>
    <menu
      style:position="absolute"
      style:left="{menuRect.right}px"
      style:top="{menuRect.top}px"
    >
      <li><button>Menu item</button></li>
    </menu>
  </Portal>
{/if}

{#each factoryUnits as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay {x} {y} {unit} />
{/each}
