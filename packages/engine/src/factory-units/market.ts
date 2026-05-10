import type { Game } from "../game";
import { Timer } from "../util/timer";
import { ContainerUnit } from "./container-unit";

export class Market extends ContainerUnit {
  constructor(
    slotCount: number,
    readonly sellInterval: number,
  ) {
    super(slotCount);

    this.sellTimer = new Timer(this.sellInterval);
  }

  private sellTimer: Timer;

  doUpdate(game: Game, deltaTime: number): void {
    if (this.sellTimer.update(deltaTime)) {
      for (const resource of this.getContainedResources())
        game.inventory.sellResource(resource);

      this.clear();
    }
  }
}
