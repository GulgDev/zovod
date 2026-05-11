import type { ProductionPlant } from "../factory-units/production-plant";
import type { ResourceKind } from "../resource-kind";
import type { Pricing } from "./pricing";

/**
 * A class that stores player's money and workforce unit amount, controls all
 * purchases/sales, and assigns/unassigns workforce from {@link ProductionPlant}
 * factory units.
 */
export class Inventory {
  /**
   * @param currentBalance - Initial amount of money on the balance.
   * @param pricing - A record containing purchase/sell prices of workforce units and all resources.
   */
  constructor(
    private currentBalance: number,
    private readonly pricing: Pricing,
  ) {}

  get balance(): number {
    return this.currentBalance;
  }

  /**
   * Calculate the maximum amount of a certain unit that can be purchased with
   * the current {@link balance}.
   *
   * @param price - The price of the purchasable unit.
   * @returns An integer representing the maximum affordable amount of the unit.
   */
  private getMaxAffordableAmount(price: number): number {
    return Math.floor(this.currentBalance / price);
  }

  /**
   * Try to remove the given amount of money from the current {@link balance}.
   *
   * @returns `false` if there is not enough money, otherwise `true` if the
   * operation was successful.
   */
  spendMoney(amount: number): boolean {
    if (this.currentBalance < amount) return false;
    this.currentBalance -= amount;
    return true;
  }

  /**
   * Add the given amount of money to the current {@link balance}.
   */
  earnMoney(amount: number): void {
    this.currentBalance += amount;
  }

  /**
   * Retrieve the purchase price of a resource from the {@link Pricing}
   * specified at the construction time.
   */
  getResourcePrice(resourceKind: ResourceKind): number {
    return this.pricing[resourceKind].buy;
  }

  /**
   * Retrieve the sell price of a resource from the {@link Pricing} specified
   * at the construction time.
   */
  getResourceSellPrice(resourceKind: ResourceKind): number {
    return this.pricing[resourceKind].sell;
  }

  /**
   * Calculate the maximum amount of resources that can be purchased with the
   * current {@link balance} using the {@link Pricing} specified at the
   * construction time.
   *
   * @returns An integer representing the maximum affordable amount of the resource.
   */
  getMaxAffordableResourceAmount(resourceKind: ResourceKind): number {
    return this.getMaxAffordableAmount(this.pricing[resourceKind].buy);
  }

  /**
   * Try to remove the total price of the specified resource kind from the
   * current {@link balance}, given the amount.
   *
   * @returns `false` if there is not enough money, otherwise `true` if the
   * operation was successful.
   */
  buyResource(resource: ResourceKind, amount = 1): boolean {
    return this.spendMoney(this.pricing[resource].buy * amount);
  }

  /**
   * Add the total price of the specified resource kind to the current
   * {@link balance}, given the amount.
   */
  sellResource(resource: ResourceKind, amount = 1): void {
    this.earnMoney(this.pricing[resource].sell * amount);
  }

  /**
   * Retrieve the purchase price of a workforce unit from the {@link Pricing}
   * specified at the construction time.
   */
  getWorkforceUnitPrice(): number {
    return this.pricing.workforceUnit.buy;
  }

  /**
   * Retrieve the sell price of a workforce unit from the {@link Pricing}
   * specified at the construction time.
   */
  getWorkforceUnitSellPrice(): number {
    return this.pricing.workforceUnit.sell;
  }

  /**
   * Calculate the maximum amount of workforce that can be purchased with the
   * current {@link balance} using the {@link Pricing} specified at the
   * construction time.
   *
   * @returns An integer representing the maximum affordable number of workforce units.
   */
  getMaxAffordableWorkforceUnits(): number {
    return this.getMaxAffordableAmount(this.pricing.workforceUnit.buy);
  }

  /** The total number of workforce units ever purchased. */
  get totalWorkforce(): number {
    return this.currentTotalWorkforce;
  }
  private currentTotalWorkforce = 0;

  /**
   * The number of available workforce units that are not assigned to a
   * {@link ProductionPlant}.
   *
   * @see {@link assignWorkforce}
   * @see {@link unassignWorkforce}
   */
  get unassignedWorkforce(): number {
    return this.currentUnassignedWorkforce;
  }
  private currentUnassignedWorkforce = 0;

  /**
   * Try to remove the total price of the given amount of workforce units from
   * the current {@link balance}, and add corresponding number of workforce
   * units to {@link totalWorkforce} upon success.
   *
   * @returns `false` if there is not enough money, otherwise `true` if the
   * operation was successful.
   */
  buyWorkforce(units: number): boolean {
    const canAfford = this.spendMoney(this.pricing.workforceUnit.buy * units);
    if (canAfford) {
      this.currentTotalWorkforce += units;
      this.currentUnassignedWorkforce += units;
    }
    return canAfford;
  }

  /**
   * Add the total price of the given amount of workforce units to the current
   * {@link balance}, and remove the corresponding number of unassigned
   * workforce units from {@link totalWorkforce}.
   *
   * @throws Will throw an error if {@link unassignedWorkforce} is less than the specified amount of workforce units.
   */
  sellWorkforce(units: number): void {
    if (this.currentUnassignedWorkforce < units)
      throw new Error("Not enough unassigned workers to sell");

    this.currentTotalWorkforce -= units;
    this.currentUnassignedWorkforce -= units;
    this.earnMoney(this.pricing.workforceUnit.sell * units);
  }

  /**
   * Assign the given amount of workforce units to the specified
   * {@link ProductionPlant}. The assigned workforce must be unassigned to
   * become available again.
   *
   * @throws Will throw an error if {@link unassignedWorkforce} is less than the specified amount of workforce units.
   *
   * @see {@link unassignWorkforce}
   */
  assignWorkforce(productionPlant: ProductionPlant, units: number): void {
    if (this.currentUnassignedWorkforce < units)
      throw new Error("Not enough unassigned workers");

    this.currentUnassignedWorkforce -= units;
    Inventory.assignedWorkforce.set(
      productionPlant,
      Inventory.getAssignedWorkforce(productionPlant) + units,
    );
  }

  /**
   * Unassign the given amount of workforce units from the specified
   * {@link ProductionPlant}.
   *
   * @throws Will throw an error if the {@link ProductionPlant} has less workforce units assigned than the specified amount.
   *
   * @see {@link assignWorkforce}
   */
  unassignWorkforce(productionPlant: ProductionPlant, units: number): void {
    const plantAssignedWorkforce =
      Inventory.getAssignedWorkforce(productionPlant);
    if (plantAssignedWorkforce < units)
      throw new Error(
        "The production plant has fewer workforce units than were prompted to be unassigned",
      );

    this.currentUnassignedWorkforce += units;
    Inventory.assignedWorkforce.set(
      productionPlant,
      plantAssignedWorkforce - units,
    );
  }

  private static assignedWorkforce = new WeakMap<ProductionPlant, number>();

  static getAssignedWorkforce(productionPlant: ProductionPlant): number {
    return this.assignedWorkforce.get(productionPlant) ?? 0;
  }
}
