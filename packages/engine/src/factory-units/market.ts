import type { Game } from "../game";
import { Timer } from "./util/timer";
import { ContainerUnit } from "./abstract/container-unit";

// TODO: allow multiple incoming flows
export class Market extends ContainerUnit {
  constructor(
    slotCount: number,
    readonly sellInterval: number,
  ) {
    super(slotCount);

    this.sellTimer = new Timer(this.sellInterval);
  }

  private sellTimer: Timer;

  protected doUpdate(game: Game, deltaTime: number): void {
    if (this.sellTimer.update(deltaTime)) {
      this.sellTimer.reset(this.sellInterval);

      for (const [resourceKind, amount] of this.getContainedResources())
        game.inventory.sellResource(resourceKind, amount);

      this.clear();
    }
  }
}
