import { when } from "jest-when";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MockProxy, mockDeep } from "vitest-mock-extended";
import { Storage } from "../../src/factory-units/storage";
import type { ResourceKind } from "../../src/resource-kind";
import { UnitMock } from "../util/unit-mock";
import { FactoryMap } from "../../src/factory-map";
import type { Game } from "../../src/game"; // used for mocks

vi.mock("../../src/factory-map");

const resourceA: ResourceKind = "a",
  resourceB: ResourceKind = "b";

describe("Factory units - Storage", () => {
  describe("life cycle", () => {
    let game: MockProxy<Game>;

    let storage: Storage, sender: UnitMock, target: UnitMock;

    beforeEach(() => {
      game = mockDeep<Game>();

      storage = new Storage(2);

      sender = new UnitMock();
      target = new UnitMock();

      when(vi.mocked(FactoryMap.getTargetDistribution))
        .calledWith(sender)
        .mockReturnValue(new Map([[storage, 1]]));

      when(vi.mocked(FactoryMap.getTargetDistribution))
        .calledWith(storage)
        .mockReturnValue(new Map([[target, 1]]));
    });

    it("accepts and stores resources", () => {
      expect(sender.send(resourceA)).toBeTrue();

      expect(storage.availableSlotCount).toBe(1);
      expect(Array.from(storage.getContainedResources())).toIncludeSameMembers([
        resourceA,
      ]);

      expect(sender.send(resourceB)).toBeTrue();

      expect(storage.availableSlotCount).toBe(0);
      expect(Array.from(storage.getContainedResources())).toIncludeSameMembers([
        resourceA,
        resourceB,
      ]);
    });

    it("sends stored resources to available targets", () => {
      sender.send(resourceA);
      sender.send(resourceB);

      target.canAccept.mockReturnValue(false);
      storage.update(game, 1);
      expect(Array.from(storage.getContainedResources())).toIncludeSameMembers([
        resourceA,
        resourceB,
      ]);

      target.canAccept.mockReturnValue(true);
      storage.update(game, 1);
      expect(Array.from(storage.getContainedResources())).toBeEmpty();

      expect(target.accept).toHaveBeenCalledTimes(2);
      expect(target.accept).toHaveBeenCalledWith(resourceA);
      expect(target.accept).toHaveBeenCalledWith(resourceB);
    });

    it("does not accept resources when full", () => {
      sender.send(resourceA);
      sender.send(resourceB);

      expect(sender.send(resourceA)).toBeFalse();
    });
  });
});
