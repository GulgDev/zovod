import type { ResourceKind } from "../resource-kind";
import { Timer } from "./util/timer";
import { FactoryUnit } from "./abstract/factory-unit";
import type { Game } from "../game";
import { Inventory } from "../economy/inventory";

export class ProductionPlant extends FactoryUnit {
  constructor(
    readonly consumedKind: ResourceKind,
    readonly producedKind: ResourceKind,
    readonly requiredWorkforceUnits: number,
    /**
     * The amount of resources that can be handled per second per workforce unit.
     */
    readonly throughputPerWorkforceUnit: number,
  ) {
    super();
  }

  override get active(): boolean {
    return (
      super.active &&
      Inventory.getAssignedWorkforce(this) >= this.requiredWorkforceUnits
    );
  }

  private productionTimer = new Timer();

  /**
   * Determines whether there's currently a resource that is awaiting to be sent
   * whenever there is a target available.
   */
  private pending = false;

  protected canAccept(resource: ResourceKind): boolean {
    return !this.pending && resource === this.consumedKind;
  }

  protected accept(): void {
    this.pending = true;
    this.productionTimer.reset(
      1 /
        (this.throughputPerWorkforceUnit *
          Inventory.getAssignedWorkforce(this)),
    );
  }

  protected doUpdate(_game: Game, deltaTime: number): void {
    this.productionTimer.update(deltaTime);
    if (this.productionTimer.expired && this.pending) {
      if (this.send(this.producedKind)) this.pending = false;
    }
  }

  override remove(): void {
    if (Inventory.getAssignedWorkforce(this) > 0)
      throw new Error(
        "Cannot remove a production plant with workforce assigned to it.",
      );
  }
}
