import type { ProductionPlant } from "../factory-units/production-plant";
import type { ResourceKind } from "../resource-kind";
import type { Pricing } from "./pricing";

export class Inventory {
  constructor(
    private currentBalance: number,
    private readonly pricing: Pricing,
  ) {}

  get balance(): number {
    return this.currentBalance;
  }

  private getMaxAffordableAmount(price: number): number {
    return Math.floor(this.currentBalance / price);
  }

  spendMoney(amount: number): boolean {
    if (this.currentBalance < amount) return false;
    this.currentBalance -= amount;
    return true;
  }

  earnMoney(amount: number): void {
    this.currentBalance += amount;
  }

  getResourcePrice(resource: ResourceKind): number {
    return this.pricing[resource].buy;
  }

  getResourceSellPrice(resource: ResourceKind): number {
    return this.pricing[resource].sell;
  }

  getMaxAffordableResourceAmount(resource: ResourceKind): number {
    return this.getMaxAffordableAmount(this.pricing[resource].buy);
  }

  buyResource(resource: ResourceKind, amount = 1): boolean {
    return this.spendMoney(this.pricing[resource].buy * amount);
  }

  sellResource(resource: ResourceKind, amount = 1): void {
    this.earnMoney(this.pricing[resource].sell * amount);
  }

  getWorkforceUnitPrice(): number {
    return this.pricing.workforceUnit.buy;
  }

  getWorkforceUnitSellPrice(): number {
    return this.pricing.workforceUnit.sell;
  }

  getMaxAffordableWorkforceUnits(): number {
    return this.getMaxAffordableAmount(this.pricing.workforceUnit.buy);
  }

  private currentTotalWorkforce = 0;
  get totalWorkforce(): number {
    return this.currentTotalWorkforce;
  }

  private currentUnassignedWorkforce = 0;
  get unassignedWorkforce(): number {
    return this.currentUnassignedWorkforce;
  }

  buyWorkforce(units: number): boolean {
    const canAfford = this.spendMoney(this.pricing.workforceUnit.buy * units);
    if (canAfford) {
      this.currentTotalWorkforce += units;
      this.currentUnassignedWorkforce += units;
    }
    return canAfford;
  }

  sellWorkforce(units: number): void {
    if (this.currentUnassignedWorkforce < units)
      throw new Error("Not enough unassigned workers to sell");

    this.currentTotalWorkforce -= units;
    this.currentUnassignedWorkforce -= units;
    this.earnMoney(this.pricing.workforceUnit.sell * units);
  }

  assignWorkforce(productionPlant: ProductionPlant, units: number): void {
    if (this.currentUnassignedWorkforce < units)
      throw new Error("Not enough unassigned workers");

    this.currentUnassignedWorkforce -= units;
    assignedWorkforce.set(
      productionPlant,
      Inventory.getAssignedWorkforce(productionPlant) + units,
    );
  }

  unassignWorkforce(productionPlant: ProductionPlant, units: number): void {
    const plantAssignedWorkforce =
      Inventory.getAssignedWorkforce(productionPlant);
    if (plantAssignedWorkforce < units)
      throw new Error(
        "The production plant has fewer workforce units than were prompted to be unassigned",
      );

    this.currentUnassignedWorkforce += units;
    assignedWorkforce.set(productionPlant, plantAssignedWorkforce - units);
  }

  static getAssignedWorkforce(productionPlant: ProductionPlant): number {
    return assignedWorkforce.get(productionPlant) ?? 0;
  }
}

const assignedWorkforce = new WeakMap<ProductionPlant, number>();
