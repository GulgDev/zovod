<script lang="ts">
  import {
    FlowBuilder,
    isFactoryUnitCell,
    Market,
    type FactoryMap,
    type FactoryUnit,
  } from "@zovod/engine";
  import { directionFrom, type Direction } from "./direction";
  import FlowEdge from "./FlowEdge.svelte";
  import { TILE_GAP, TILE_SIZE } from "../sizes";

  const {
    map,
    tileX,
    tileY,
  }: { map: FactoryMap; tileX: number; tileY: number } = $props();

  let flowEdges = $state<
    { x: number; y: number; from: Direction; to: Direction }[]
  >([]);

  function updateFlowEdges(): void {
    // Convert pairs of flow connections to individual edges
    flowEdges = Array.from(map.getAllFlowEdges())
      // Don't draw flows over factory units
      .filter(([, [x, y]]) => !isFactoryUnitCell(x, y))
      .flatMap(([[x1, y1], [x2, y2]]) =>
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

  const tileColumn = $derived(Math.floor(tileX)),
    tileRow = $derived(Math.floor(tileY));

  const unitPosition = $derived.by(() => {
    const unitXCandidates = Array.from(
        { length: 3 },
        (_, i) => i + (tileColumn - 1),
      )
        .map((x) => [x, Math.max(0, x - tileX, tileX - x - 1)])
        .filter(([, dx]) => dx <= 0.5),
      unitYCandidates = Array.from({ length: 3 }, (_, i) => i + (tileRow - 1))
        .map((y) => [y, Math.max(0, y - tileY, tileY - y - 1)])
        .filter(([, dy]) => dy <= 0.5);

    for (const [unitY, dy] of unitYCandidates)
      for (const [unitX, dx] of unitXCandidates) {
        if (!isFactoryUnitCell(unitX, unitY)) continue;

        if (
          (tileX >= unitX &&
            tileX < unitX + 1 &&
            (tileY < unitY || tileY >= unitY + 1)) ||
          (tileY >= unitY &&
            tileY < unitY + 1 &&
            (tileX < unitX || tileX >= unitX + 1))
        ) {
          if (dx + dy <= 0.5) return [unitX, unitY];
        }
      }
  });

  let flowBuilderState = $state<{ pointerId: number; builder: FlowBuilder }>(),
    edgesToBeBuilt = $state<
      {
        x: number;
        y: number;
        from: Direction;
        to?: Direction;
      }[]
    >([]);

  function isValidSourceUnit(unit?: FactoryUnit): boolean {
    return unit !== undefined && !(unit instanceof Market);
  }
</script>

{const source = $derived(map.getFlowNodeSource(tileColumn, tileRow))}

{#if !flowBuilderState}
  {#if unitPosition && isValidSourceUnit(map.getUnitAt(unitPosition[0], unitPosition[1])) && source === undefined}
    {const [unitX, unitY] = $derived(unitPosition)}

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <image
      x={(unitX / 2) * (TILE_SIZE + TILE_GAP) +
        (tileColumn - unitX) * (TILE_SIZE / 2 + TILE_GAP / 4) +
        TILE_SIZE / 2 -
        0.14 / 2}
      y={(unitY / 2) * (TILE_SIZE + TILE_GAP) +
        (tileRow - unitY) * (TILE_SIZE / 2 + TILE_GAP / 4) +
        TILE_SIZE / 2 -
        0.14 / 2}
      width="0.14"
      height="0.14"
      preserveAspectRatio="none"
      href="{import.meta.env.BASE_URL}flow/add.svg"
      style:cursor="pointer"
      onpointerdown={(ev): void => {
        if (ev.button !== 0) return;

        ev.stopPropagation();
        flowBuilderState = {
          pointerId: ev.pointerId,
          builder: new FlowBuilder(map, unitX, unitY),
        };
      }}
    />
  {:else if !isFactoryUnitCell(tileColumn, tileRow) && source !== undefined && /* exclude reserved flow nodes */ !(source[0] === tileColumn && source[1] === tileRow)}
    <FlowEdge
      x={tileColumn}
      y={tileRow}
      from={directionFrom(tileColumn, tileRow, ...source)}
      opacity="0.5"
    />
  {/if}
{/if}

<svelte:document
  onpointerdowncapture={!flowBuilderState &&
  !isFactoryUnitCell(tileColumn, tileRow) &&
  source !== undefined &&
  // exclude reserved flow nodes
  !(source[0] === tileColumn && source[1] === tileRow)
    ? (ev): void => {
        if (ev.button !== 0) return;

        ev.stopPropagation();
        flowBuilderState = {
          pointerId: ev.pointerId,
          builder: new FlowBuilder(map, tileColumn, tileRow),
        };
      }
    : undefined}
  onpointerup={flowBuilderState &&
    ((ev): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { pointerId, builder } = flowBuilderState!;
      if (ev.pointerId !== pointerId) return;

      builder.build();
      flowBuilderState = undefined;
      edgesToBeBuilt = [];
    })}
  onpointermove={flowBuilderState &&
    ((ev): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { pointerId, builder } = flowBuilderState!;
      if (ev.pointerId !== pointerId) return;

      builder.lineTo(tileColumn, tileRow);

      const points = [
        // when branching from a flow, include the source as a context for flow edge direction
        ...(isFactoryUnitCell(...builder.points[0])
          ? []
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            [map.getFlowNodeSource(...builder.points[0])!]),
        ...builder.points,
      ];

      edgesToBeBuilt = points
        .slice(
          1,
          isFactoryUnitCell(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...points.at(-1)!, // there's always at least one point
          )
            ? -1
            : undefined,
        )
        .flatMap(([x2, y2], i) => {
          // i = original index - 1
          const prev = points[i],
            next = points.at(i + 2);
          return {
            x: x2,
            y: y2,
            from: directionFrom(x2, y2, ...prev),
            to: next && directionFrom(x2, y2, ...next),
          };
        });
    })}
/>

{#each [...edgesToBeBuilt, ...flowEdges] as edge ((BigInt(edge.to ?? 4) << 32n) | BigInt((edge.y << 16) | (edge.x & 0xffff)) & 0xffffffffn)}
  <FlowEdge
    onremove={(): void => {
      map.deleteFlowBranchAt(edge.x, edge.y);
    }}
    {...edge}
  />
{/each}
