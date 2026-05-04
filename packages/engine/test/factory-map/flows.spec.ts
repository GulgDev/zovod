import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/map";
import { UnitMock } from "./util/unit-mock";

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
  });
});
