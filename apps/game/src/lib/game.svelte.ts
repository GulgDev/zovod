import { Game, Inventory, Market } from "@zovod/engine";
import { on } from "svelte/events";
import equal from "fast-deep-equal/es6";
import { resourceKinds, workforceUnit } from "./economy/resource-kinds";

export const game = new Game(
  new Inventory(200, {
    ...Object.fromEntries(
      Object.entries(resourceKinds).map(([kind, { price }]) => [kind, price]),
    ),
    workforceUnit: workforceUnit.price,
  }),
);

function gameOver(): void {
  alert("Игра окончена! Вы разорились.");
  close();
}

// Passive expenses
let currentExpenses = 5 / 60; // start from 5 rubles per minute

const INCREMENT = 2 / 60, // increment by 2 rubles per minute
  INCREMENT_INTERVAL = 60; // increment every minute

let timeSinceLastIncrement = 0;
game.addEventListener("update", (ev) => {
  timeSinceLastIncrement += ev.deltaTime;
  while (timeSinceLastIncrement >= INCREMENT_INTERVAL) {
    currentExpenses += INCREMENT;
    timeSinceLastIncrement -= INCREMENT_INTERVAL;
  }

  if (!game.inventory.spendMoney(currentExpenses * ev.deltaTime)) gameOver();
});

// Initialize the factory map by adding a market.
// Note that because market spans multiple tiles, we prohibit creating flows
// inbetween those tiles
//      0   1   2
//
// -2   @   .   .
//
// -1   x   x   @
//
//  0   @   x   x
//
//  1   x   x   @
//
//  2   @   .   .
const market = new Market(20, 30);
game.factoryMap.placeUnit(market, 0, -2);
game.factoryMap.placeUnit(market, 0, 0);
game.factoryMap.placeUnit(market, 0, 2);
game.factoryMap.placeUnit(market, 2, -1);
game.factoryMap.placeUnit(market, 2, 1);
game.factoryMap.reserveFlowNode(0, -1);
game.factoryMap.reserveFlowNode(0, 1);
game.factoryMap.reserveFlowNode(1, -1);
game.factoryMap.reserveFlowNode(1, 0);
game.factoryMap.reserveFlowNode(1, 1);
game.factoryMap.reserveFlowNode(2, 0);

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
      if (!equal(newValue, current)) current = newValue;
    }),
  );

  return () => current;
}
