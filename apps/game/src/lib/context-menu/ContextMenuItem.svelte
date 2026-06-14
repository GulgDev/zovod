<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  const {
    children,
    ...props
  }: { children: Snippet } & HTMLAttributes<HTMLButtonElement> = $props();
</script>

<li>
  <button {...props}>
    {@render children()}
  </button>
</li>

<style>
  button {
    width: 100%;
    box-sizing: border-box;
    padding: 4px 12px;

    text-align: left;

    cursor: pointer;

    background: none;
    color: #36302b;
    border: none;
  }

  button:hover {
    background-color: #f7eacd;
  }
</style>
