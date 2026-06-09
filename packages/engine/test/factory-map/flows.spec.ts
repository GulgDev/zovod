import { describe, expect, it } from "vitest";
import { FactoryMap } from "../../src/factory-map";
import { UnitMock } from "../util/unit-mock";
import {
  map,
  unitChangeListener,
  flowChangeListener,
} from "./util/with-factory-map";

describe("FactoryMap - flow map", () => {
  describe("addFlowSegment", () => {
    it("adds flow segments", () => {
      //      0   1   2
      // -1   .   .   @
      //
      //  0   @   .   .
      //
      //  1   .   .   @
      map.placeUnit(new UnitMock(), 0, 0);
      map.placeUnit(new UnitMock(), 2, 1);
      map.placeUnit(new UnitMock(), 2, -1);

      //      0   1   2
      // -1   .   .   @
      //
      //  0   @ > . > .
      //      ~~~~~~~~v
      //  1   .   .  ~@
      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeTrue();

      expect(flowChangeListener).toHaveBeenCalled();
      expect(map.getFlowNodeTargets(0, 0)).toIncludeSameMembers([[1, 0]]);
      expect(map.getFlowNodeTargets(1, 0)).toIncludeSameMembers([[2, 0]]);
      expect(map.getFlowNodeTargets(2, 0)).toIncludeSameMembers([[2, 1]]);

      flowChangeListener.mockClear();

      //      0   1   2
      // -1   .   .  ~@
      //             ~^
      //  0   @ > . >~.
      //              v
      //  1   .   .   @
      expect(
        map.addFlowSegment([
          [2, 0],
          [2, -1],
        ]),
      ).toBeTrue();

      expect(flowChangeListener).toHaveBeenCalled();
      expect(map.getFlowNodeTargets(2, 0)).toIncludeSameMembers([
        [2, 1],
        [2, -1],
      ]);
    });

    it("returns false when the flow segment has an invalid start", () => {
      //      0   1   2
      // -1   .   .   @
      //
      //  0   #   .   .
      //
      //  1   .   .   @
      map.placeUnit(new UnitMock(), 2, 1);
      map.placeUnit(new UnitMock(), 2, -1);

      // empty unit cell
      //      0   1   2
      // -1   .   .   @
      //
      //  0   # > . > .
      //      ~~~~~~~~v
      //  1   .   .  ~@
      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();

      // empty non-unit (flow) cell
      //      0   1   2
      // -1   .   .  ~@
      //             ~^
      //  0   #   .  ~.
      //
      //  1   .   .   @
      expect(
        map.addFlowSegment([
          [2, 0],
          [2, -1],
        ]),
      ).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();
    });

    it("returns false when the flow segment has an invalid end", () => {
      //      0   1   2
      //  0   @   .   .
      //
      //  1   .   .   #
      map.placeUnit(new UnitMock(), 0, 0);

      // empty unit cell
      //      0   1   2
      //  0   @ > . > .
      //      ~~~~~~~~v
      //  1   .   .  ~#
      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
        ]),
      ).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();
    });

    it("returns false when the flow segment crosses an existing flow", () => {
      //      0   1   2
      // -1   .   .   @
      //
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      map.placeUnit(new UnitMock(), 0, 0);
      map.placeUnit(new UnitMock(), 2, 1);
      map.placeUnit(new UnitMock(), 2, -1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);
      flowChangeListener.mockClear();

      //      0   1   2
      // -1   .   .  ~@
      //             ~^
      //  0   @ > . >~.
      //      ~~~~~~~ v
      //  1   .   .   @
      expect(
        map.addFlowSegment([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, -1],
        ]),
      ).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();

      //      0   1   2
      // -1   .   .   @
      //
      //  0   @ > . > .
      //     ~v       v
      //  1  ~. > . > @
      //      ~~~~~~~~~
      expect(
        map.addFlowSegment([
          [0, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ]),
      ).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();
    });

    it("throws when the flow segment traverses through a unit cell", () => {
      //      0   1   2   3   4
      //  0   # > . > .   .  ~#
      //      ~~~~~~~~v      ~^
      //  1   .   .  ~# > . >~.
      //              ~~~~~~~
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

      expect(flowChangeListener).not.toHaveBeenCalled();
    });

    it("throws when the flow segment is non-continuous", () => {
      //      0   1   2
      //  0   #   .   .
      //      ~~~~~~~~
      //  1   .   .  ~#
      expect(() =>
        map.addFlowSegment([
          [0, 0],
          [2, 1],
        ]),
      ).toThrow("Cannot connect");

      expect(flowChangeListener).not.toHaveBeenCalled();
    });

    it("adds corresponding targets to the distribution", () => {
      //      0   1   2
      // -1   .   .   @
      //
      //  0   @   .   .
      //
      //  1   .   .   @
      const unit$0$0 = new UnitMock(),
        unit$2$1 = new UnitMock(),
        unit$2$_1 = new UnitMock();
      map.placeUnit(unit$0$0, 0, 0);
      map.placeUnit(unit$2$1, 2, 1);
      map.placeUnit(unit$2$_1, 2, -1);

      //      0   1   2
      // -1   .   .   @
      //
      //  0   @ > . > .
      //      ~~~~~~~~v
      //  1   .   .  ~@
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);

      expect(FactoryMap.getTargetDistribution(unit$0$0).get(unit$2$1)).toBe(1);

      //      0   1   2
      // -1   .   .  ~@
      //             ~^
      //  0   @ > . >~.
      //              v
      //  1   .   .   @
      map.addFlowSegment([
        [2, 0],
        [2, -1],
      ]);

      expect(FactoryMap.getTargetDistribution(unit$0$0).get(unit$2$1)).toBe(
        0.5,
      );
      expect(FactoryMap.getTargetDistribution(unit$0$0).get(unit$2$_1)).toBe(
        0.5,
      );
    });
  });

  describe("deleteFlowBranchAt", () => {
    it.each([
      //      0   1   2
      //  0   @ > . > .
      //      ~~~     v
      //  1   .   .   @
      ["the start", 0, 0],

      //      0   1   2
      //  0   @ > . > .
      //        ~~~~~ v
      //  1   .   .   @
      ["the middle", 1, 0],

      //      0   1   2
      //  0   @ > . > .
      //             ~v
      //  1   .   .  ~@
      ["the end", 2, 1],
    ])("deletes the flow branch at %s", (_, x, y) => {
      //      0   1   2
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      map.placeUnit(new UnitMock(), 0, 0);
      map.placeUnit(new UnitMock(), 2, 1);
      map.addFlowSegment([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]);
      flowChangeListener.mockClear();

      expect(map.deleteFlowBranchAt(x, y)).toBeTrue();

      expect(flowChangeListener).toHaveBeenCalled();
      expect(map.getFlowNodeTargets(0, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(1, 0)).toBeEmpty();
      expect(map.getFlowNodeTargets(2, 0)).toBeEmpty();
    });

    it("returns false when the flow branch is absent", () => {
      expect(map.deleteFlowBranchAt(0, 0)).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();

      expect(map.deleteFlowBranchAt(1, 0)).toBeFalse();

      expect(flowChangeListener).not.toHaveBeenCalled();
    });

    it("removes corresponding targets from the distribution", () => {
      //      0   1   2
      // -1   .   .   @
      //              ^
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit$0$0 = new UnitMock(),
        unit$2$1 = new UnitMock(),
        unit$2$_1 = new UnitMock();
      map.placeUnit(unit$0$0, 0, 0);
      map.placeUnit(unit$2$1, 2, 1);
      map.placeUnit(unit$2$_1, 2, -1);
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

      //      0   1   2
      // -1   .   .   @
      //              ^
      //  0   @ > . > .
      //             ~v
      //  1   .   .  ~@
      map.deleteFlowBranchAt(2, 1);

      expect(
        FactoryMap.getTargetDistribution(unit$0$0).has(unit$2$1),
      ).toBeFalse();
      expect(FactoryMap.getTargetDistribution(unit$0$0).get(unit$2$_1)).toBe(1);

      //      0   1   2
      // -1   .   .  ~@
      //             ~^
      //  0   @ > . > .
      //
      //  1   .   .   @
      map.deleteFlowBranchAt(2, -1);

      expect(
        FactoryMap.getTargetDistribution(unit$0$0).has(unit$2$_1),
      ).toBeFalse();
    });
  });

  describe("getAllFlowSegments", () => {
    it("finds all flow segments", () => {
      //      0   1   2
      // -1   .   .   @
      //              ^
      //  0   @ > . > .
      //              v
      //  1   .   .   @
      const unit$0$0 = new UnitMock(),
        unit$2$1 = new UnitMock(),
        unit$2$_1 = new UnitMock();
      map.placeUnit(unit$0$0, 0, 0);
      map.placeUnit(unit$2$1, 2, 1);
      map.placeUnit(unit$2$_1, 2, -1);
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
