import { ResourceKind } from "../resource-kind";
import { Timer } from "../util/timer";
import { FactoryUnit } from "../factory/factory-unit";
import { Game } from "..";

export class ProductionPlant extends FactoryUnit {
  assignedWorkforceUnits = 0;

  constructor(
    readonly consumedKind: ResourceKind,
    readonly producedKind: ResourceKind,
    readonly requiredWorkforceUnits: number,
    readonly throughputPerWorkforceUnit: number,
  ) {
    super();
  }

  get isWorking(): boolean {
    return this.assignedWorkforceUnits >= this.requiredWorkforceUnits;
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
      this.throughputPerWorkforceUnit * this.assignedWorkforceUnits,
    );
  }

  doUpdate(_game: Game, deltaTime: number): void {
    if (!this.isWorking) return;

    if (this.productionTimer.update(deltaTime)) this.send(this.producedKind);
  }
}
