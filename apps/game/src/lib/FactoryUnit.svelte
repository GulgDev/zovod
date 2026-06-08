<script lang="ts">
  import type { FactoryUnit } from "@zovod/engine";

  const { x, y, unit }: { x: number; y: number; unit: FactoryUnit } = $props();
</script>

<use
  {x}
  {y}
  href="{import.meta.env.BASE_URL}grid-tile.svg#grid-tile"
  filter="url({import.meta.env.BASE_URL}filter-glow.svg#filter-glow-{unit.active
    ? 'green'
    : 'red'})"
  style:--fill="#f7eacd"
  style:--stroke={unit.active ? "#d7e088" : "#ffbcaa"}
/>
