<script lang="ts">
  import Stats from "./Stats.svelte";
</script>

<div class="topbar">
  <Stats />
</div>

<style>
  .topbar {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    align-items: center;
    padding: 12px 80px;
  }
</style>
