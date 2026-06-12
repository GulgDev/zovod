<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    target = $bindable(), // eslint-disable-line no-useless-assignment
  }: {
    children: Snippet;
    target: Snippet | undefined;
  } = $props();

  $effect(() => {
    target = children;
    return (): void => {
      target = undefined;
    };
  });
</script>
