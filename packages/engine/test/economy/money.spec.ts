import { describe, expect, it } from "vitest";
import { Inventory } from "../../src/economy/inventory";
import { Pricing } from "../../src/economy/pricing";
import { ResourceKind } from "../../src/resource-kind";

const dummyPricing: Pricing = {
  workforceUnit: { buy: 0, sell: 0 },
};

const resourceA: ResourceKind = 0,
  resourceB: ResourceKind = 1;

describe("Inventory - money", () => {
  describe("spendMoney", () => {
    it("removes money from the balance", () => {
      const inventory = new Inventory(150, dummyPricing);

      expect(inventory.spendMoney(100)).toBeTrue();

      expect(inventory.balance).toBe(50);
    });

    it("fails if there is not enough money", () => {
      const inventory = new Inventory(150, dummyPricing);

      expect(inventory.spendMoney(200)).toBeFalse();

      expect(inventory.balance).toBe(150);
    });
  });

  describe("earnMoney", () => {
    it("adds money to the balance", () => {
      const inventory = new Inventory(50, dummyPricing);

      inventory.earnMoney(100);

      expect(inventory.balance).toBe(150);
    });
  });

  describe("getResourcePrice", () => {
    it("retrieves the price of the resource", () => {
      const inventory = new Inventory(50, {
        ...dummyPricing,
        [resourceA]: { buy: 100, sell: 0 },
        [resourceB]: { buy: 200, sell: 0 },
      });

      expect(inventory.getResourcePrice(resourceA)).toBe(100);
      expect(inventory.getResourcePrice(resourceB)).toBe(200);
    });
  });

  describe("getResourceSellPrice", () => {
    it("retrieves the sell price of the resource", () => {
      const inventory = new Inventory(50, {
        ...dummyPricing,
        [resourceA]: { buy: 0, sell: 100 },
        [resourceB]: { buy: 0, sell: 200 },
      });

      expect(inventory.getResourceSellPrice(resourceA)).toBe(100);
      expect(inventory.getResourceSellPrice(resourceB)).toBe(200);
    });
  });

  describe("getMaxAffordableResourceAmount", () => {
    it("calculates the max affordable amount of a resource", () => {
      const inventory = new Inventory(250, {
        ...dummyPricing,
        [resourceA]: { buy: 100, sell: 0 },
        [resourceB]: { buy: 40, sell: 0 },
      });

      expect(inventory.getMaxAffordableResourceAmount(resourceA)).toBe(2);
      expect(inventory.getMaxAffordableResourceAmount(resourceB)).toBe(6);
    });
  });
});
