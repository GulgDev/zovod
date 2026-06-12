<script lang="ts">
  import ContextMenu from "../../context-menu/ContextMenu.svelte";
  import ContextMenuItem from "../../context-menu/ContextMenuItem.svelte";

  let { open = $bindable(), rect }: { open: boolean; rect?: DOMRectReadOnly } =
    $props();
</script>

<ContextMenu bind:open {rect}>
  <ContextMenuItem>
    <span class="name">Хранилище</span>
    <span class="price">100,000 р.</span>
  </ContextMenuItem>
  <ContextMenuItem>
    <span class="name">Прядильный отдел</span>
    <span class="price">100,000 р.</span>
  </ContextMenuItem>
</ContextMenu>

<style>
  .name {
    padding-inline-end: 32px;
  }

  .price {
    float: right;
  }
</style>
