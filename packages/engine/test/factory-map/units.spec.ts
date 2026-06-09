import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/factory-map";
import { UnitMock } from "../util/unit-mock";
import {
  map,
  unitChangeListener,
  flowChangeListener,
} from "./util/with-factory-map";

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
      invalidPositions.forEach(([x, y]) =>
        expect(() => map.getUnitAt(x, y)).toThrow("Invalid unit position"),
      );
    });
  });

  describe("placeUnit", () => {
    it("places and retrieves units", () => {
      const unit1 = new UnitMock(),
        unit2 = new UnitMock();

      expect(map.placeUnit(unit1, 0, 0)).toBeTrue();

      expect(unitChangeListener).toHaveBeenCalled();
      expect(map.getUnitAt(0, 0)).toBe(unit1);
      expect(map.getUnitAt(2, 1)).toBeUndefined();

      unitChangeListener.mockClear();
      expect(map.placeUnit(unit2, 2, 1)).toBeTrue();

      expect(unitChangeListener).toHaveBeenCalled();
      expect(map.getUnitAt(0, 0)).toBe(unit1);
      expect(map.getUnitAt(2, 1)).toBe(unit2);
    });

    it("returns false when placing on an occupied cell", () => {
      map.placeUnit(new UnitMock(), 0, 0);
      unitChangeListener.mockClear();

      expect(map.placeUnit(new UnitMock(), 0, 0)).toBeFalse();

      expect(unitChangeListener).not.toHaveBeenCalled();
    });

    it("throws for invalid positions", () => {
      invalidPositions.forEach(([x, y]) => {
        expect(() => map.placeUnit(new UnitMock(), x, y)).toThrow(
          "Invalid unit position",
        );

        expect(unitChangeListener).not.toHaveBeenCalled();
      });
    });
  });

  describe("removeUnitAt", () => {
    it("removes units", () => {
      const unit1 = new UnitMock(),
        unit2 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);
      unitChangeListener.mockClear();

      expect(map.removeUnitAt(0, 0)).toBeTrue();

      expect(unitChangeListener).toHaveBeenCalled();
      expect(map.getUnitAt(0, 0)).toBeUndefined();
      expect(map.getUnitAt(2, 1)).toBe(unit2);

      unitChangeListener.mockClear();
      expect(map.removeUnitAt(2, 1)).toBeTrue();

      expect(unitChangeListener).toHaveBeenCalled();
      expect(map.getUnitAt(0, 0)).toBeUndefined();
      expect(map.getUnitAt(2, 1)).toBeUndefined();
    });

    it("returns false for empty cells", () => {
      expect(map.removeUnitAt(0, 0)).toBeFalse();
      expect(unitChangeListener).not.toHaveBeenCalled();
    });

    it("throws for invalid positions", () => {
      invalidPositions.forEach(([x, y]) => {
        expect(() => map.removeUnitAt(x, y)).toThrow("Invalid unit position");

        expect(unitChangeListener).not.toHaveBeenCalled();
      });
    });

    it("removes incoming flows", () => {
      //      0   1   2
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit$0$0 = new UnitMock(),
        unit$2$1 = new UnitMock();
      map.placeUnit(unit$0$0, 0, 0);
      map.placeUnit(unit$2$1, 2, 1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      //      0   1   2
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      //              ~
      map.removeUnitAt(2, 1);

      expect(flowChangeListener).toHaveBeenCalled();
      expect(map.getFlowNodeTargets(0, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(1, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(2, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(2, 0)).toBeEmpty();
      expect(
        FactoryMap.getTargetDistribution(unit$0$0).has(unit$2$1),
      ).toBeFalse();
    });
  });

  describe("getAllUnits", () => {
    it("retrieves all units", () => {
      const unit1 = new UnitMock(),
        unit2 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);

      expect([...map.getAllUnits()]).toIncludeSameMembers([unit1, unit2]);

      map.removeUnitAt(0, 0);
      map.removeUnitAt(2, 1);

      expect(map.getAllUnits()).toBeEmpty();
    });
  });

  describe("getAllUnitsWithCoords", () => {
    it("retrieves all units with their respective coordinates", () => {
      const unit1 = new UnitMock(),
        unit2 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);

      expect([...map.getAllUnitsWithCoords()]).toIncludeSameMembers([
        [[0, 0], unit1],
        [[2, 1], unit2],
      ]);

      map.removeUnitAt(0, 0);
      map.removeUnitAt(2, 1);

      expect(map.getAllUnitsWithCoords()).toBeEmpty();
    });
  });

  describe("setTargetDistribution", () => {
    it("changes the target distribution", () => {
      //      0   1   2
      // -1   .   .   @
      //
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit1 = new UnitMock(),
        unit2 = new UnitMock(),
        unit3 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);
      map.placeUnit(unit3, 2, -1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);
      map.addFlowSegment([
        [2, 0],
        [2, -1],
      ]);

      FactoryMap.setTargetDistribution(
        unit1,
        new Map([
          [unit2, 0.8],
          [unit3, 0.2],
        ]),
      );

      expect(
        Array.from(FactoryMap.getTargetDistribution(unit1).entries()),
      ).toIncludeSameMembers([
        [unit2, 0.8],
        [unit3, 0.2],
      ]);
    });

    it("throws when the distribution is not normalized", () => {
      //      0   1   2
      // -1   .   .   @
      //              ^
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit1 = new UnitMock(),
        unit2 = new UnitMock(),
        unit3 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);
      map.placeUnit(unit3, 2, -1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);
      map.addFlowSegment([
        [2, 0],
        [2, -1],
      ]);

      expect(() =>
        FactoryMap.setTargetDistribution(
          unit1,
          new Map([
            [unit2, 1],
            [unit3, 0.25],
          ]),
        ),
      ).toThrow("The new distribution is not normalized");
    });

    it("throws when a target is missing from the distribution", () => {
      //      0   1   2
      // -1   .   .   @
      //              ^
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit1 = new UnitMock(),
        unit2 = new UnitMock(),
        unit3 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);
      map.placeUnit(unit3, 2, -1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);
      map.addFlowSegment([
        [2, 0],
        [2, -1],
      ]);

      expect(() =>
        FactoryMap.setTargetDistribution(unit1, new Map([[unit2, 1]])),
      ).toThrow("The new distribution has invalid target list");
    });

    it("throws when the distribution contains an extra target", () => {
      const map = new FactoryMap();

      //      0   1   2
      // -1   .   .   @
      //              ^
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit1 = new UnitMock(),
        unit2 = new UnitMock(),
        unit3 = new UnitMock();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      expect(() =>
        FactoryMap.setTargetDistribution(
          unit1,
          new Map([
            [unit2, 0.8],
            [unit3, 0.2],
          ]),
        ),
      ).toThrow("The new distribution has invalid target list");
    });
  });
});
