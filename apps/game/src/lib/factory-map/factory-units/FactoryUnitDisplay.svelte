<script lang="ts">
  import {
    Market,
    ProductionPlant,
    Storage,
    type FactoryUnit,
  } from "@zovod/engine";
  import { on } from "svelte/events";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
  import FactoryUnitModal from "./FactoryUnitModal.svelte";
  import { game } from "../../game";

  const {
    onremove,
    x,
    y,
    unit,
  }: { onremove: () => void; x: number; y: number; unit: FactoryUnit } =
    $props();

  let active = $derived(unit.active);
  $effect(() =>
    on(game, "update", () => {
      if (active !== unit.active) active = unit.active;
    }),
  );

  let modalOpen = $state(false);
</script>

<FactoryUnitTile
  {x}
  {y}
  fill="#f7eacd"
  stroke={active ? "#d7e088" : "#ffbcaa"}
  icon="{import.meta.env.BASE_URL}factory-unit/{unit instanceof ProductionPlant
    ? `production-plant/${unit.producedKind}`
    : unit instanceof Storage
      ? 'storage'
      : unit instanceof Market
        ? 'market'
        : ((): never => {
            throw new TypeError('Invalid factory unit type.');
          })()}-{active ? 'green' : 'red'}.svg"
  filter="url({import.meta.env.BASE_URL}filter-glow.svg#filter-glow-{active
    ? 'green'
    : 'red'})"
  style="cursor: pointer;"
  onclick={(): void => {
    modalOpen = true;
  }}
/>

<FactoryUnitModal {onremove} {unit} {active} bind:open={modalOpen} />
