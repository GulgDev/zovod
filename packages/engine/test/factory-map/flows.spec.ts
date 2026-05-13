import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/factory-map";
import { UnitMock } from "../util/unit-mock";

describe("FactoryMap - flow map", () => {
  describe("addFlowSegment", () => {
    it("adds flow segments", () => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 0, 0);
      map.placeUnit(new UnitMock(), 2, 1);
      map.placeUnit(new UnitMock(), 2, -1);

      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeTrue();
      expect(map.getFlowNodeTargets(0, 0)).toIncludeSameMembers([[1, 0]]);
      expect(map.getFlowNodeTargets(1, 0)).toIncludeSameMembers([[2, 0]]);
      expect(map.getFlowNodeTargets(2, 0)).toIncludeSameMembers([[2, 1]]);

      expect(
        map.addFlowSegment([
          [2, 0],
          [2, -1],
        ]),
      ).toBeTrue();
      expect(map.getFlowNodeTargets(2, 0)).toIncludeSameMembers([
        [2, 1],
        [2, -1],
      ]);
    });

    it("returns false when the flow segment has an invalid start", () => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 2, 1);
      map.placeUnit(new UnitMock(), 2, -1);

      // empty unit cell
      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeFalse();

      // empty non-unit (flow) cell
      expect(
        map.addFlowSegment([
          [2, 0],
          [2, -1],
        ]),
      ).toBeFalse();
    });

    it("returns false when the flow segment has an invalid end", () => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 0, 0);

      // empty unit cell
      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeFalse();
    });

    it("returns false when the flow segment crosses an existing flow", () => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 0, 0);
      map.placeUnit(new UnitMock(), 2, 1);
      map.placeUnit(new UnitMock(), 2, -1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, -1],
        ]),
      ).toBeFalse();

      expect(
        map.addFlowSegment([
          [0, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ]),
      ).toBeFalse();
    });

    it("throws when the flow segment traverses through a unit cell", () => {
      const map = new FactoryMap();

      expect(() =>
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
          [3, 1],
          [4, 1],
          [4, 0],
        ]),
      ).toThrow("Flow segment cannot traverse through a unit cell");
    });

    it("throws when the flow segment is non-continuous", () => {
      const map = new FactoryMap();

      expect(() =>
        map.addFlowSegment([
          [0, 0],
          [2, 1],
        ]),
      ).toThrow("Cannot connect");
    });

    it("adds corresponding targets to the distribution", () => {
      const map = new FactoryMap();
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

      expect(FactoryMap.getTargetDistribution(unit1).get(unit2)).toBe(1);

      map.addFlowSegment([
        [2, 0],
        [2, -1],
      ]);

      expect(FactoryMap.getTargetDistribution(unit1).get(unit2)).toBe(0.5);
      expect(FactoryMap.getTargetDistribution(unit1).get(unit3)).toBe(0.5);
    });
  });

  describe("deleteFlowBranchAt", () => {
    it.each([
      ["the start", 0, 0],
      ["the middle", 1, 0],
      ["the end", 2, 1],
    ])("deletes the flow branch at %s", (_, x, y) => {
      const map = new FactoryMap();
      map.placeUnit(new UnitMock(), 0, 0);
      map.placeUnit(new UnitMock(), 2, 1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      expect(map.deleteFlowBranchAt(x, y)).toBeTrue();
      expect(map.getFlowNodeTargets(0, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(1, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(2, 0)).toBeEmpty();
    });

    it("returns false when the flow branch is absent", () => {
      const map = new FactoryMap();

      expect(map.deleteFlowBranchAt(0, 0)).toBeFalse();
      expect(map.deleteFlowBranchAt(1, 0)).toBeFalse();
    });

    it("removes corresponding targets from the distribution", () => {
      const map = new FactoryMap();
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

      map.deleteFlowBranchAt(2, 1);

      expect(FactoryMap.getTargetDistribution(unit1).has(unit2)).toBeFalse();
      expect(FactoryMap.getTargetDistribution(unit1).get(unit3)).toBe(1);

      map.deleteFlowBranchAt(2, -1);

      expect(FactoryMap.getTargetDistribution(unit1).has(unit3)).toBeFalse();
    });
  });

  describe("getAllFlowSegments", () => {
    it("finds all flow segments", () => {
      const map = new FactoryMap();
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

      expect(Array.from(map.getAllFlowSegments())).toIncludeSameMembers([
        [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
        [
          [2, 0],
          [2, 1],
        ],
        [
          [2, 0],
          [2, -1],
        ],
      ]);
    });
  });
});
