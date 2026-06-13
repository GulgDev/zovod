<script lang="ts">
  const { active }: { active: boolean } = $props();
</script>

<svg width="12" height="12" viewBox="-1 -1 2 2">
  <circle cx="0" cy="0" r="1" fill={active ? "#c7c768" : "#ffbcaa"} />
</svg>
