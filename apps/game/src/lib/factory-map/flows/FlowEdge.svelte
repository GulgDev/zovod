<script lang="ts">
  import { isFactoryUnitCell } from "@zovod/engine";
  import { UNIT_VECTORS, type Direction } from "./direction";
  import ContextMenu from "../../context-menu/ContextMenu.svelte";
  import ContextMenuItem from "../../context-menu/ContextMenuItem.svelte";
  import Portal from "../../util/Portal.svelte";
  import { contextMenu } from "../../context-menu.svelte";
  import {
    FLOW_EDGE_RADIUS,
    FLOW_UNIT_PADDING,
    TILE_GAP,
    TILE_SIZE,
  } from "../sizes";

  const {
    onremove,
    x,
    y,
    from,
    to,
  }: {
    onremove?: () => void;
    x: number;
    y: number;
    from: Direction;
    to?: Direction;
  } = $props();

  // The idea is to find a bounding box for the flow edge, which is always
  // either a vertical or a horizontal rectangle:
  // ######||######
  // ======||######
  // ######||######
  // ######||======
  // ######||######
  // ======||######
  // ######||######
  const { top, left, width, height } = $derived(
    x % 2 === 0
      ? // the flow edge is between two unit tiles vertically
        {
          top: TILE_SIZE + (TILE_SIZE + TILE_GAP) * ((y - 1) / 2),
          left: (TILE_SIZE + TILE_GAP) * (x / 2),
          width: TILE_SIZE,
          height: TILE_GAP,
        }
      : // the flow edge is between two unit tiles horizontally
        {
          top: (TILE_SIZE - TILE_GAP) / 4 + (TILE_SIZE + TILE_GAP) * (y / 2),
          left: TILE_SIZE + (TILE_SIZE + TILE_GAP) * ((x - 1) / 2),
          width: TILE_GAP,
          height: (TILE_SIZE + TILE_GAP) / 2,
        },
  );

  const cx = $derived(left + width / 2),
    cy = $derived(top + height / 2);

  function findEdgeCenter(direction: Direction): readonly number[] {
    const [unitX, unitY] = UNIT_VECTORS[direction];
    let edgeX = left + width * ((unitX + 1) / 2), // remap -1..1 -> 0..1
      edgeY = top + height * ((unitY + 1) / 2);

    // if the edge connects to a factory unit tile, add padding
    if (isFactoryUnitCell(x + unitX, y + unitY)) {
      edgeX -= unitX * FLOW_UNIT_PADDING;
      edgeY -= unitY * FLOW_UNIT_PADDING;
    }

    return [edgeX, edgeY];
  }

  const [x0, y0] = $derived(findEdgeCenter(from)),
    [x1, y1] = $derived(to !== undefined ? findEdgeCenter(to) : [cx, cy]);

  let contextMenuState = $state<{
    left: number;
    top: number;
  }>();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<path
  d={to === undefined || (to - from + 4) % 2 === 0
    ? // straight line
      `M ${x0} ${y0} L ${x1} ${y1}`
    : // rounded line
      // segment from starting edge to round part
      `M ${x0} ${y0} L ${cx + FLOW_EDGE_RADIUS * UNIT_VECTORS[from][0]} ${cy + FLOW_EDGE_RADIUS * UNIT_VECTORS[from][1]} ` +
      // round part
      `A ${FLOW_EDGE_RADIUS} ${FLOW_EDGE_RADIUS} 0 0 ` +
      `${+((to - from + 4) % 4 === 3)}` + // arc direction
      `${cx + FLOW_EDGE_RADIUS * UNIT_VECTORS[to][0]} ${cy + FLOW_EDGE_RADIUS * UNIT_VECTORS[to][1]} ` +
      // segment from round part to ending edge
      `L ${x1} ${y1}`}
  fill="none"
  stroke="#f0d8aa"
  stroke-linecap="round"
  stroke-width="0.04"
  marker-end={to === undefined ||
  isFactoryUnitCell(x + UNIT_VECTORS[to][0], y + UNIT_VECTORS[to][1])
    ? `url(${import.meta.env.BASE_URL}arrow-marker.svg#arrow-marker)` // add a marker at the flow end
    : null}
  onclick={(ev): void => {
    contextMenuState = { left: ev.clientX, top: ev.clientY };
  }}
/>

{#if contextMenuState}
  <Portal bind:target={contextMenu.current}>
    <ContextMenu
      bind:open={
        (): boolean => contextMenuState !== undefined,
        (open): void => {
          if (!open) contextMenuState = undefined;
        }
      }
      left={contextMenuState.left}
      top={contextMenuState.top}
    >
      {#if onremove}
        <ContextMenuItem onclick={onremove}>Убрать поток</ContextMenuItem>
      {/if}
    </ContextMenu>
  </Portal>
{/if}
