import { describe, expect, it, vi } from "vitest";
import { UnitMock } from "../util/unit-mock";
import type { ResourceKind } from "../../src/resource-kind";
import { FactoryMap } from "../../src/factory/factory-map";

vi.mock("../../src/factory/factory-map");

const resource: ResourceKind = "resource";

describe("Factory units - send/accept", () => {
  it("returns false when there are no targets", () => {
    const sender = new UnitMock();

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(new Map());

    expect(sender.send(resource)).toBeFalse();
  });

  it("does not send resources to targets that cannot accept it", () => {
    const sender = new UnitMock(),
      target = new UnitMock();

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
      new Map([[target, 1]]),
    );
    target.canAccept.mockReturnValueOnce(false);

    expect(sender.send(resource)).toBeFalse();
  });

  it("does not send resources to targets that are paused", () => {
    const sender = new UnitMock(),
      target = new UnitMock();
    target.paused = true;

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
      new Map([[target, 1]]),
    );
    target.canAccept.mockReturnValueOnce(true);

    expect(sender.send(resource)).toBeFalse();
  });

  it("calls the `accept` method of the target", () => {
    const sender = new UnitMock(),
      target = new UnitMock();

    vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
      new Map([[target, 1]]),
    );
    target.canAccept.mockReturnValueOnce(true);

    expect(sender.send(resource)).toBeTrue();

    expect(target.accept).toHaveBeenCalledExactlyOnceWith(resource);
  });
});
