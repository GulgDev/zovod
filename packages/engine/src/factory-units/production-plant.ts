import type { ResourceKind } from "../resource-kind";
import { Timer } from "../util/timer";
import { FactoryUnit } from "../factory/factory-unit";
import type { Game } from "..";
import { Inventory } from "../economy/inventory";

export class ProductionPlant extends FactoryUnit {
  constructor(
    readonly consumedKind: ResourceKind,
    readonly producedKind: ResourceKind,
    readonly requiredWorkforceUnits: number,
    readonly throughputPerWorkforceUnit: number,
  ) {
    super();
  }

  get isWorking(): boolean {
    return Inventory.getAssignedWorkforce(this) >= this.requiredWorkforceUnits;
  }

  private productionTimer = new Timer();

  protected canAccept(resource: ResourceKind): boolean {
    return (
      this.isWorking &&
      this.productionTimer.expired &&
      resource === this.consumedKind
    );
  }

  protected accept(): void {
    this.productionTimer.reset(
      this.throughputPerWorkforceUnit * Inventory.getAssignedWorkforce(this),
    );
  }

  doUpdate(_game: Game, deltaTime: number): void {
    if (!this.isWorking) return;

    if (this.productionTimer.update(deltaTime)) this.send(this.producedKind);
  }
}
