<script lang="ts">
  import type { FactoryUnit } from "@zovod/engine";
  import ContextMenu from "../../context-menu/ContextMenu.svelte";
  import ContextMenuItem from "../../context-menu/ContextMenuItem.svelte";
  import { factoryUnitTypes } from "../../economy/factory-unit-types";

  let {
    open = $bindable(),
    left,
    top,
    onplace,
  }: {
    open: boolean;
    left: number;
    top: number;
    onplace: (unit: FactoryUnit) => void;
  } = $props();

  const currencyFormat = new Intl.NumberFormat("ru-RU", {
    style: "decimal",
  });
</script>

<ContextMenu bind:open {left} {top}>
  {#each factoryUnitTypes as factoryUnitType (factoryUnitType.name)}
    {#if factoryUnitType.price && factoryUnitType.create}
      <!-- eslint-disable-next-line @typescript-eslint/no-non-null-assertion -->
      <ContextMenuItem onclick={(): void => onplace(factoryUnitType.create!())}>
        <span class="name">{factoryUnitType.name}</span>
        <span class="price">
          {currencyFormat.format(factoryUnitType.price.buy)} р.
        </span>
      </ContextMenuItem>
    {/if}
  {/each}
</ContextMenu>

<style>
  .name {
    padding-inline-end: 32px;
  }

  .price {
    float: right;
  }
</style>
