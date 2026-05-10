import { describe, expect, it, vi } from "vitest";
import { UnitMock } from "../util/unit-mock";
import type { ResourceKind } from "../../src/resource-kind";
import { FactoryMap } from "../../src/factory/factory-map";

vi.mock("../../src/factory/factory-map");

const resource: ResourceKind = 1;

describe("Factory units - send/accept", () => {
  it("returns false when there are no targets", () => {
    const sender = new UnitMock(1);

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(new Map());

    expect(sender.send(resource)).toBeFalse();
  });

  it("returns false when there are no available acceptors", () => {
    const sender = new UnitMock(1),
      target = new UnitMock(2);

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
      new Map([[target, 1]]),
    );
    target.canAccept.mockReturnValueOnce(false);

    expect(sender.send(resource)).toBeFalse();
  });

  it("calls the `accept` method of the target", () => {
    const sender = new UnitMock(1),
      target = new UnitMock(2);

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
      new Map([[target, 1]]),
    );
    target.canAccept.mockReturnValueOnce(true);

    expect(sender.send(resource)).toBeTrue();

    expect(target.accept).toHaveBeenCalled();
  });
});
