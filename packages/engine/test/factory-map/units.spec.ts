import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/map";
import { FactoryUnit } from "../../src/factory-unit";

// An empty class just to allow instantiation (FactoryUnit is abstract)
class UnitMock extends FactoryUnit {}

// Unit cell coordinates must satisfy (2n, 2m + n)
const invalidPositions = [
  [-2, -2],
  [-2, 2],
  [0, -1],
  [0, 1],
  [2, -2],
  [2, 2],
] as const;

describe("FactoryMap - unit map", () => {
  describe("getUnitAt", () => {
    it("throws for invalid positions", () => {
      const map = new FactoryMap();

      invalidPositions.forEach(([x, y]) =>
        expect(() => map.getUnitAt(x, y)).toThrow("Invalid unit position"),
      );
    });
  });

  describe("placeUnit", () => {
    it("places and retrieves units", () => {
      const map = new FactoryMap();

      const unit1 = new UnitMock(),
        unit2 = new UnitMock();

      map.placeUnit(unit1, 0, 0);
      expect(map.getUnitAt(0, 0)).toBe(unit1);
      expect(map.getUnitAt(2, 1)).toBeUndefined();

      map.placeUnit(unit2, 2, 1);
      expect(map.getUnitAt(0, 0)).toBe(unit1);
      expect(map.getUnitAt(2, 1)).toBe(unit2);
    });

    it("throws for invalid positions", () => {
      const map = new FactoryMap();

      invalidPositions.forEach(([x, y]) =>
        expect(() => map.placeUnit(new UnitMock(), x, y)).toThrow(
          "Invalid unit position",
        ),
      );
    });

    it("throws when placing on an occupied cell", () => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 0, 0);

      expect(() => map.placeUnit(new UnitMock(), 0, 0)).toThrow(
        "A unit is already placed at",
      );
    });
  });

  describe("removeUnitAt", () => {
    it("removes units", () => {
      const map = new FactoryMap();

      const unit1 = new UnitMock(),
        unit2 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);

      map.removeUnitAt(0, 0);
      expect(map.getUnitAt(0, 0)).toBeUndefined();
      expect(map.getUnitAt(2, 1)).toBe(unit2);

      map.removeUnitAt(2, 1);
      expect(map.getUnitAt(2, 1)).toBeUndefined();
    });

    it("throws for invalid positions", () => {
      const map = new FactoryMap();

      invalidPositions.forEach(([x, y]) =>
        expect(() => map.removeUnitAt(x, y)).toThrow("Invalid unit position"),
      );
    });

    it("throws for empty cells", () => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 0, 0);

      expect(() => map.removeUnitAt(0, 0)).not.toThrow();
      expect(() => map.removeUnitAt(2, 1)).toThrow("No unit to remove at");
    });
  });
});
