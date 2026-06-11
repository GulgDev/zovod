<script lang="ts">
  import { type FactoryMap, type FactoryUnit } from "@zovod/engine";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";

  const { map }: { map: FactoryMap } = $props();

  let factoryUnits = $state<[readonly [number, number], FactoryUnit][]>();

  function updateFactoryUnits(): void {
    factoryUnits = Array.from(map.getAllUnitsWithCoords());
  }

  $effect(() => {
    map.addEventListener("unitchange", updateFactoryUnits);
    updateFactoryUnits();
  });
</script>

{#each factoryUnits as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay {x} {y} {unit} />
{/each}
