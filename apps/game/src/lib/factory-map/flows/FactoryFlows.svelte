<script lang="ts">
  import { type FactoryMap } from "@zovod/engine";
  import { directionFrom, type Direction } from "./direction";
  import FlowEdge from "./FlowEdge.svelte";

  const { map }: { map: FactoryMap } = $props();

  let flowEdges = $state<
    { x: number; y: number; from: Direction; to: Direction }[]
  >([]);

  function updateFlowEdges(): void {
    // Convert pairs of flow connections to individual edges
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
</script>

{#each flowEdges as edge ((edge.y << 16) | (edge.x & 0xffff))}
  <FlowEdge {...edge} />
{/each}
