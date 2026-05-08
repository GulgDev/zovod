import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/factory/factory-map";
import { DummyUnit } from "../util/dummy-unit";

describe("FactoryMap - flow map", () => {
  describe("addFlowSegment", () => {
    it("adds flow segments", () => {
      const map = new FactoryMap();
      map.placeUnit(new DummyUnit(), 0, 0);
      map.placeUnit(new DummyUnit(), 2, 1);
      map.placeUnit(new DummyUnit(), 2, -1);

      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeTrue();
      expect(map.getFlowTargets(0, 0)).toIncludeSameMembers([[1, 0]]);
      expect(map.getFlowTargets(1, 0)).toIncludeSameMembers([[2, 0]]);
      expect(map.getFlowTargets(2, 0)).toIncludeSameMembers([[2, 1]]);

      expect(
        map.addFlowSegment([
          [2, 0],
          [2, -1],
        ]),
      ).toBeTrue();
      expect(map.getFlowTargets(2, 0)).toIncludeSameMembers([
        [2, 1],
        [2, -1],
      ]);
    });

    it("fails when the flow segment has empty source or target", () => {
      const map = new FactoryMap();
      map.placeUnit(new DummyUnit(), 0, 0);

      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeFalse();

      expect(
        map.addFlowSegment([
          [2, 1],
          [2, 0],
          [1, 0],
          [0, 0],
        ]),
      ).toBeFalse();
    });

    it("fails when the flow segment crosses an existing flow", () => {
      const map = new FactoryMap();
      map.placeUnit(new DummyUnit(), 0, 0);

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
    });

    it("throws when the flow segment target is not a unit cell", () => {
      const map = new FactoryMap();
      map.placeUnit(new DummyUnit(), 0, 0);

      expect(() =>
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
        ]),
      ).toThrow("Invalid unit position");

      expect(() =>
        map.addFlowSegment([
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).not.toThrow("Invalid unit position");
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
      const unit1 = new DummyUnit(),
        unit2 = new DummyUnit(),
        unit3 = new DummyUnit();
      map.placeUnit(unit1, 0, 0);
      map.placeUnit(unit2, 2, 1);
      map.placeUnit(unit3, 2, -1);

      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      expect(unit1.getTargetDistribution().get(unit2)).toBe(1);

      map.addFlowSegment([
        [2, 0],
        [2, -1],
      ]);

      expect(unit1.getTargetDistribution().get(unit2)).toBe(0.5);
      expect(unit1.getTargetDistribution().get(unit3)).toBe(0.5);
    });
  });

  describe("deleteFlowSegmentAt", () => {
    it.each([
      ["the start", 0, 0],
      ["the middle", 1, 0],
      ["the end", 2, 1],
    ])("deletes a flow segment at %s", (_, x, y) => {
      const map = new FactoryMap();
      map.placeUnit(new DummyUnit(), 0, 0);
      map.placeUnit(new DummyUnit(), 2, 1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      expect(map.deleteFlowSegmentAt(x, y)).toBeTrue();
      expect(map.getFlowTargets(0, 0)).toBeEmpty();
      expect(map.getFlowTargets(1, 0)).toBeEmpty();
      expect(map.getFlowTargets(2, 0)).toBeEmpty();
    });

    it("fails when flow segment is absent", () => {
      const map = new FactoryMap();

      expect(map.deleteFlowSegmentAt(0, 0)).toBeFalse();
      expect(map.deleteFlowSegmentAt(1, 0)).toBeFalse();
    });

    it("removes corresponding targets from the distribution", () => {
      const map = new FactoryMap();
      const unit1 = new DummyUnit(),
        unit2 = new DummyUnit(),
        unit3 = new DummyUnit();
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

      map.deleteFlowSegmentAt(2, 1);

      expect(unit1.getTargetDistribution().has(unit2)).toBeFalse();
      expect(unit1.getTargetDistribution().get(unit3)).toBe(1);

      map.deleteFlowSegmentAt(2, -1);

      expect(unit1.getTargetDistribution().has(unit3)).toBeFalse();
    });
  });
});
