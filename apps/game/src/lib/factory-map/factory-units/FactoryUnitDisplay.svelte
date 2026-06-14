<script lang="ts">
  import {
    Market,
    ProductionPlant,
    Storage,
    type FactoryUnit,
  } from "@zovod/engine";
  import FactoryUnitTile from "./FactoryUnitTile.svelte";
  import FactoryUnitModal from "./FactoryUnitModal.svelte";
  import { gameState } from "../../game.svelte";

  const {
    onremove,
    x,
    y,
    unit,
  }: { onremove: () => void; x: number; y: number; unit: FactoryUnit } =
    $props();

  const active = $derived.by(gameState(() => unit.active));

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

<FactoryUnitModal {onremove} {unit} bind:open={modalOpen} />
