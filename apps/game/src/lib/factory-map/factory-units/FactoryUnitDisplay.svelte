<script lang="ts">
  import {
    Market,
    ProductionPlant,
    Storage,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
  import FactoryUnitModal from "./FactoryUnitModal.svelte";

  const { x, y, unit }: { x: number; y: number; unit: FactoryUnit } = $props();

  let modalOpen = $state(false);
</script>

<FactoryUnitTile
  {x}
  {y}
  fill="#f7eacd"
  stroke={unit.active ? "#d7e088" : "#ffbcaa"}
  icon="{import.meta.env.BASE_URL}factory-unit/{unit instanceof ProductionPlant
    ? `production-plant/${unit.producedKind}`
    : unit instanceof Storage
      ? 'storage'
      : unit instanceof Market
        ? 'market'
        : ((): never => {
            throw new TypeError('Invalid factory unit type.');
          })()}-{unit.active ? 'green' : 'red'}.svg"
  filter="url({import.meta.env.BASE_URL}filter-glow.svg#filter-glow-{unit.active
    ? 'green'
    : 'red'})"
  style="cursor: pointer;"
  onclick={(): void => {
    modalOpen = true;
  }}
/>

<FactoryUnitModal bind:open={modalOpen} />
