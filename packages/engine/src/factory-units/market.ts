import { Timer } from "../ticker/timer";
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

  doUpdate(deltaTime: number): void {
    if (this.sellTimer.update(deltaTime)) {
      for (const resource of this.getContainedResources()); // TODO: sell

      this.clear();
    }
  }
}
