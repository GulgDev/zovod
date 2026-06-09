<script lang="ts">
  import { Storage, type FactoryMap, type FactoryUnit } from "@zovod/engine";
  import { directionFrom, type Direction } from "./direction";
  import FactoryUnitDisplay from "./FactoryUnitDisplay.svelte";
  import FlowEdge from "./FlowEdge.svelte";

  const { map }: { map: FactoryMap } = $props();

  let factoryUnits = $state<[readonly [number, number], FactoryUnit][]>();

  function updateFactoryUnits(): void {
    factoryUnits = Array.from(map.getAllUnitsWithCoords());
  }

  $effect(() => {
    map.addEventListener("unitchange", updateFactoryUnits);
    updateFactoryUnits();
  });

  let flowEdges = $state<
    { x: number; y: number; from: Direction; to: Direction }[]
  >([]);

  function updateFlowEdges(): void {
    flowEdges = Array.from(map.getAllFlowEdges()).flatMap(
      ([[x1, y1], [x2, y2]]) =>
        map.getFlowNodeTargets(x2, y2).map(([x3, y3]) => ({
          x: x2,
          y: y2,
          from: directionFrom(x2, y2, x1, y1),
          to: directionFrom(x2, y2, x3, y3),
        })),
    );
  }

  $effect(() => {
    map.addEventListener("flowchange", updateFlowEdges);
    updateFlowEdges();
  });

  $effect(() => {
    //      0   1   2
    // -1   .   .   @
    //
    //  0   @ > . > .
    //              v
    //  1   .   .   @
    map.placeUnit(new Storage(5), 0, 0);
    map.placeUnit(new Storage(4), 2, 1);
    map.placeUnit(new Storage(3), 2, -1);
    map.addFlowSegment([
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ]);
  });
</script>

{#each factoryUnits as [[x, y], unit] ((y << 16) | (x & 0xffff))}
  <FactoryUnitDisplay {x} {y} {unit} />
{/each}

{#each flowEdges as edge ((edge.y << 16) | (edge.x & 0xffff))}
  <FlowEdge {...edge} />
{/each}
