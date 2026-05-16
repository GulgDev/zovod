import { when } from "jest-when";
import { beforeEach, describe, expect, it } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { FlowBuilder } from "../src/factory-map/util/flow-builder";
import { type FactoryMap } from "../src/factory-map";

describe("FlowBuilder", () => {
  let factoryMap: MockProxy<FactoryMap>;

  beforeEach(() => {
    factoryMap = mock<FactoryMap>();

    factoryMap.getFlowNodeSource.mockReturnValue(undefined);
  });

  it("connects two points with a straight line", () => {
    //      0   1   2   3   4
    //  0   #   .   .   .   #
    //      ~
    const builder = new FlowBuilder(factoryMap, 0, 0);

    //      0   1   2   3   4
    //  0   #   .   .   .   #
    //                      ~
    builder.lineTo(4, 0);

    //      0   1   2   3   4
    //  0   # > . > . > . > #
    expect(builder.build()).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ]);
  });

  it("connects two points with a polyline", () => {
    //      0   1   2
    //  0   #   .   .
    //      ~
    //  1   .   .   #
    const builder = new FlowBuilder(factoryMap, 0, 0);

    //      0   1   2
    //  0   #   .   .
    //
    //  1   .   .   #
    //              ~
    builder.lineTo(2, 1);

    //      0   1   2
    //  0   # > .   .
    //          v
    //  1   .   . > #
    expect(builder.build()).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ]);
  });

  it("returns to a point that's already in the path", () => {
    //      0   1   2   3   4
    //  0   # > . > . > . > #
    const builder = new FlowBuilder(factoryMap, 0, 0);
    builder.lineTo(4, 0);

    //      0   1   2   3   4
    //  0   # > . > . > . > #
    //              ~
    builder.lineTo(2, 0);

    //      0   1   2   3   4
    //  0   # > . > .   .   #
    expect(builder.build()).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
  });

  it("goes around unit cells", () => {
    //      0   1   2   3   4   5
    //  0   #   .   .   .   #   .
    //      ~
    const builder = new FlowBuilder(factoryMap, 0, 0);

    //      0   1   2   3   4   5
    //  0   #   .   .   .   #   .
    //                          ~
    builder.lineTo(5, 0);

    // There are two equivalent valid results
    expect(builder.build()).toBeOneOf([
      //      0   1   2   3   4   5
      // -1   .   .   .   . > . > .
      //                  ^       v
      //  0   # > . > . > .   #   .
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [3, -1],
        [4, -1],
        [5, -1],
        [5, 0],
      ],

      //      0   1   2   3   4   5
      //  0   # > . > . > .   #   .
      //                 v        ^
      //  1   .   .   #   . > . > .
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [3, 1],
        [4, 1],
        [5, 1],
        [5, 0],
      ],
    ]);
  });

  it("goes around ending unit cells when continuing the path", () => {
    //      0   1   2   3   4
    //  0   # > . > . > . > #
    const builder = new FlowBuilder(factoryMap, 0, 0);
    builder.lineTo(4, 0);

    //      0   1   2   3   4   5
    //  0   # > . > . > . > #   .
    //                          ~
    builder.lineTo(5, 0);

    // There are two equivalent valid results
    expect(builder.build()).toBeOneOf([
      //      0   1   2   3   4   5
      // -1   .   .   .   . > . > .
      //                  ^       v
      //  0   # > . > . > .   #   .
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [3, -1],
        [4, -1],
        [5, -1],
        [5, 0],
      ],

      //      0   1   2   3   4   5
      //  0   # > . > . > .   #   .
      //                 v        ^
      //  1   .   .   #   . > . > .
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [3, 1],
        [4, 1],
        [5, 1],
        [5, 0],
      ],
    ]);
  });

  it("stops at cells occupied by existing flows", () => {
    //      0   1   2   3   4
    // -1   .   .  ~#   .   .
    //             ~v
    //  0   #   .  ~.   .   #
    when(factoryMap.getFlowNodeSource)
      .calledWith(2, 0)
      .mockReturnValueOnce([2, -1]);

    //      0   1   2   3   4
    // -1   .   .   #   .   .
    //              v
    //  0   #   .   .   .   #
    //      ~
    const builder = new FlowBuilder(factoryMap, 0, 0);

    //      0   1   2   3   4
    // -1   .   .   #   .   .
    //              v
    //  0   #   .   .   .   #
    //                      ~
    builder.lineTo(4, 0);

    //      0   1   2   3   4
    // -1   .   .   #   .   .
    //              v
    //  0   # > .   .   .   #
    //      ~~~~~
    expect(builder.build()).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });
});
