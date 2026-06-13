import { Game, Inventory } from "@zovod/engine";

export const game = new Game(
  new Inventory(0, { workforceUnit: { buy: 0, sell: 0 } }),
);
