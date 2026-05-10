import type { Game } from "..";
import { FactoryMap } from "./factory-map";

export class Factory {
  readonly map = new FactoryMap();

  update(game: Game, deltaTime: number): void {
    for (const unit of this.map.getAllUnits()) unit.update(game, deltaTime);
  }
}
