import { Game, Inventory } from "@zovod/engine";
import { on } from "svelte/events";

export const game = new Game(
  new Inventory(0, { workforceUnit: { buy: 0, sell: 0 } }),
);

/**
 * Creates a reactive state by listening to game update events and checking if a
 * certain value changed.
 *
 * @param callback - A function to get the current value.
 * @returns A reactive function that can later be passed to `$derived.by`.
 */
export function gameState<T>(callback: () => T): () => T {
  let current = $state(callback());

  $effect(() =>
    on(game, "update", () => {
      const newValue = callback();
      if (newValue !== current) current = newValue;
    }),
  );

  return () => current;
}
