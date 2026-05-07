import { ResourceKind } from "../resource-kind";
import { Pricing } from "./pricing";

export class Wallet {
  constructor(
    private currentBalance: number,
    private readonly pricing: Pricing,
  ) {}

  get balance(): number {
    return this.currentBalance;
  }

  spend(amount: number): boolean {
    if (this.currentBalance < amount) return false;
    this.currentBalance -= amount;
    return true;
  }

  earn(amount: number): void {
    this.currentBalance += amount;
  }

  getResourcePrice(resource: ResourceKind): number {
    return this.pricing[resource].buy;
  }

  getResourceSellPrice(resource: ResourceKind): number {
    return this.pricing[resource].sell;
  }

  getMaxAffordableResourceAmount(resource: ResourceKind): number {
    return Math.floor(this.currentBalance / this.pricing[resource].buy);
  }

  buyResource(resource: ResourceKind, amount = 1): boolean {
    return this.spend(this.pricing[resource].buy * amount);
  }

  sellResource(resource: ResourceKind, amount = 1): void {
    this.earn(this.pricing[resource].sell * amount);
  }

  getWorkForceUnitPrice(): number {
    return this.pricing.workForceUnit.buy;
  }

  getMaxAffordableWorkForceUnits(): number {
    return Math.floor(this.currentBalance / this.pricing.workForceUnit.buy);
  }

  buyWorkForce(units: number): boolean {
    return this.spend(this.pricing.workForceUnit.buy * units);
  }
}
