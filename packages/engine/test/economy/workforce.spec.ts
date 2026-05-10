import { describe, expect, it } from "vitest";
import { Inventory } from "../../src/economy/inventory";

describe("Inventory - workforce", () => {
  describe("buyWorkforce", () => {
    it("spends money and adds the corresponding amount of workforce units", () => {
      const inventory = new Inventory(250, {
        workforceUnit: { buy: 100, sell: 0 },
      });

      expect(inventory.buyWorkforce(2)).toBeTrue();

      expect(inventory.totalWorkforce).toBe(2);
      expect(inventory.unassignedWorkforce).toBe(2);
      expect(inventory.balance).toBe(50);
    });

    it("fails when there is not enough money", () => {
      const inventory = new Inventory(250, {
        workforceUnit: { buy: 100, sell: 0 },
      });

      expect(inventory.buyWorkforce(3)).toBeFalse();

      expect(inventory.totalWorkforce).toBe(0);
      expect(inventory.unassignedWorkforce).toBe(0);
      expect(inventory.balance).toBe(250);
    });
  });

  describe("sellWorkforce", () => {
    it("earns money", () => {
      const inventory = new Inventory(0, {
        workforceUnit: { buy: 0, sell: 100 },
      });
      inventory.buyWorkforce(2);

      expect(() => inventory.sellWorkforce(2)).not.toThrow(
        "Not enough unassigned workers to sell",
      );

      expect(inventory.totalWorkforce).toBe(0);
      expect(inventory.unassignedWorkforce).toBe(0);
      expect(inventory.balance).toBe(200);
    });

    it("throws when there is not enough unassigned workforce", () => {
      const inventory = new Inventory(0, {
        workforceUnit: { buy: 100, sell: 0 },
      });

      expect(() => inventory.sellWorkforce(1)).toThrow(
        "Not enough unassigned workers to sell",
      );
    });
  });
});
