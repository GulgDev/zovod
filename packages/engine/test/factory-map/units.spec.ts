import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/factory/factory-map";
import { DummyUnit } from "../util/dummy-unit";

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

      const unit1 = new DummyUnit(1),
        unit2 = new DummyUnit(2);

      expect(map.placeUnit(unit1, 0, 0)).toBeTrue();
      expect(map.getUnitAt(0, 0)).toBe(unit1);
      expect(map.getUnitAt(2, 1)).toBeUndefined();

      expect(map.placeUnit(unit2, 2, 1)).toBeTrue();
      expect(map.getUnitAt(0, 0)).toBe(unit1);
      expect(map.getUnitAt(2, 1)).toBe(unit2);
    });

    it("fails when placing on an occupied cell", () => {
      const map = new FactoryMap();

      expect(map.placeUnit(new DummyUnit(1), 0, 0)).toBeTrue();
      expect(map.placeUnit(new DummyUnit(2), 0, 0)).toBeFalse();
    });

    it("throws for invalid positions", () => {
      const map = new FactoryMap();

      invalidPositions.forEach(([x, y]) =>
        expect(() => map.placeUnit(new DummyUnit(1), x, y)).toThrow(
          "Invalid unit position",
        ),
      );
    });
  });

  describe("removeUnitAt", () => {
    it("removes units", () => {
      const map = new FactoryMap();

      const unit1 = new DummyUnit(1),
        unit2 = new DummyUnit(2);
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);

      expect(map.removeUnitAt(0, 0)).toBeTrue();
      expect(map.getUnitAt(0, 0)).toBeUndefined();
      expect(map.getUnitAt(2, 1)).toBe(unit2);

      expect(map.removeUnitAt(2, 1)).toBeTrue();
      expect(map.getUnitAt(2, 1)).toBeUndefined();
    });

    it("fails for empty cells", () => {
      const map = new FactoryMap();
      map.placeUnit(new DummyUnit(1), 0, 0);

      expect(map.removeUnitAt(0, 0)).toBeTrue();
      expect(map.removeUnitAt(2, 1)).toBeFalse();
    });

    it("throws for invalid positions", () => {
      const map = new FactoryMap();

      invalidPositions.forEach(([x, y]) =>
        expect(() => map.removeUnitAt(x, y)).toThrow("Invalid unit position"),
      );
    });
  });

  describe("getAllUnits", () => {
    it("retrieves all units", () => {
      const map = new FactoryMap();

      const unit1 = new DummyUnit(1),
        unit2 = new DummyUnit(2);
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);

      expect([...map.getAllUnits()]).toIncludeSameMembers([unit1, unit2]);

      map.removeUnitAt(0, 0);
      map.removeUnitAt(2, 1);

      expect(map.getAllUnits()).toBeEmpty();
    });
  });
});
