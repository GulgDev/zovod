<script lang="ts">
  import Stats from "./Stats.svelte";
  import Time from "./Time.svelte";
</script>

<div class="topbar">
  <Stats />
  <Time />
</div>

<style>
  .topbar {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    align-items: center;
    padding: 12px 80px;

    width: 100%;
    box-sizing: border-box;

    user-select: none;
    pointer-events: none;
  }

  .topbar > :global(*) {
    pointer-events: all;
  }
</style>
