import { when } from "jest-when";
import { describe, expect, it, vi } from "vitest";
import { UnitMock } from "../util/unit-mock";
import type { ResourceKind } from "../../src/resource-kind";
import { FactoryMap } from "../../src/factory-map";

vi.mock("../../src/factory-map");

const resourceA: ResourceKind = "a",
  resourceB: ResourceKind = "b";

describe("Factory units - send/accept", () => {
  describe("send", () => {
    it("returns false when there are no targets", () => {
      const sender = new UnitMock();

      vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
        new Map(),
      );

      expect(sender.send(resourceA)).toBeFalse();
    });

    it("does not send resources to targets that cannot accept it", () => {
      const sender = new UnitMock(),
        target = new UnitMock();

      vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
        new Map([[target, 1]]),
      );
      target.canAccept.mockReturnValueOnce(false);

      expect(sender.send(resourceA)).toBeFalse();
    });

    it("does not send resources to targets that are paused", () => {
      const sender = new UnitMock(),
        target = new UnitMock();
      target.paused = true;

      vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
        new Map([[target, 1]]),
      );
      target.canAccept.mockReturnValueOnce(true);

      expect(sender.send(resourceA)).toBeFalse();
    });

    it("calls the `accept` method of the target", () => {
      const sender = new UnitMock(),
        target = new UnitMock();

      vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
        new Map([[target, 1]]),
      );
      target.canAccept.mockReturnValueOnce(true);

      expect(sender.send(resourceA)).toBeTrue();

      expect(target.accept).toHaveBeenCalledExactlyOnceWith(resourceA);
    });
  });

  describe("sendOneOf", () => {
    it("returns undefined when there are no targets", () => {
      const sender = new UnitMock();

      vi.mocked(FactoryMap.getTargetDistribution).mockReturnValueOnce(
        new Map(),
      );

      expect(sender.sendOneOf(new Set(resourceA))).toBeUndefined();
    });

    it("sends the resource with the most accepting targets", () => {
      const sender = new UnitMock();

      const target1 = new UnitMock();
      when(target1.canAccept).calledWith(resourceA).mockReturnValue(true);
      when(target1.canAccept).calledWith(resourceB).mockReturnValue(false);

      const target2 = new UnitMock();
      when(target2.canAccept).calledWith(resourceA).mockReturnValue(true);
      when(target2.canAccept).calledWith(resourceB).mockReturnValue(false);

      const target3 = new UnitMock();
      when(target3.canAccept).calledWith(resourceA).mockReturnValue(false);
      when(target3.canAccept).calledWith(resourceB).mockReturnValue(true);

      vi.mocked(FactoryMap.getTargetDistribution).mockReturnValue(
        new Map([
          [target1, 0.5],
          [target2, 0],
          [target3, 0.5],
        ]),
      );

      expect(sender.sendOneOf(new Set([resourceA, resourceB]))).toBe(resourceA);
      expect(target1.accept).toHaveBeenCalledExactlyOnceWith(resourceA);
    });
  });
});
