import { when } from "jest-when";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";
import { Market } from "../../src/factory-units/market";
import type { ResourceKind } from "../../src/resource-kind";
import { UnitMock } from "../util/unit-mock";
import { FactoryMap } from "../../src/factory-map";
import type { Game } from "../../src/game"; // used for mocks

vi.mock("../../src/factory-map");

const resourceA: ResourceKind = "a",
  resourceB: ResourceKind = "b";

describe("Factory units - Market", () => {
  describe("life cycle", () => {
    let game: DeepMockProxy<Game>;

    let market: Market, sender: UnitMock, target: UnitMock;

    beforeEach(() => {
      game = mockDeep<Game>();

      market = new Market(2, 1);

      sender = new UnitMock();
      target = new UnitMock();

      when(vi.mocked(FactoryMap.getTargetDistribution))
        .calledWith(sender)
        .mockReturnValue(new Map([[market, 1]]));

      when(vi.mocked(FactoryMap.getTargetDistribution))
        .calledWith(market)
        .mockReturnValue(new Map([[target, 1]]));

      target.canAccept.mockReturnValue(true);
    });

    it("accepts and stores different resources kind", () => {
      expect(sender.send(resourceA)).toBeTrue();

      expect(market.availableSlotCount).toBe(1);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        [resourceA, 1],
      ]);

      expect(sender.send(resourceB)).toBeTrue();

      expect(market.availableSlotCount).toBe(0);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        [resourceA, 1],
        [resourceB, 1],
      ]);
    });

    it("accepts and stores same resource kind", () => {
      expect(sender.send(resourceA)).toBeTrue();

      expect(market.availableSlotCount).toBe(1);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        [resourceA, 1],
      ]);

      expect(sender.send(resourceA)).toBeTrue();

      expect(market.availableSlotCount).toBe(0);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        [resourceA, 2],
      ]);
    });

    it("accepts and sells different resource kinds", () => {
      sender.send(resourceA);
      sender.send(resourceB);

      market.update(game, 0.5);

      expect(market.availableSlotCount).toBe(0);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        [resourceA, 1],
        [resourceB, 1],
      ]);
      expect(game.inventory.sellResource).not.toHaveBeenCalled();

      market.update(game, 0.5);

      expect(market.availableSlotCount).toBe(2);
      expect(Array.from(market.getContainedResources())).toBeEmpty();

      expect(game.inventory.sellResource).toHaveBeenCalledTimes(2);
      expect(game.inventory.sellResource).toHaveBeenCalledWith(resourceA, 1);
      expect(game.inventory.sellResource).toHaveBeenCalledWith(resourceB, 1);
    });

    it("accepts and sells same resource kind", () => {
      sender.send(resourceA);
      sender.send(resourceA);

      market.update(game, 0.5);

      expect(market.availableSlotCount).toBe(0);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        [resourceA, 2],
      ]);
      expect(game.inventory.sellResource).not.toHaveBeenCalled();

      market.update(game, 0.5);

      expect(market.availableSlotCount).toBe(2);
      expect(Array.from(market.getContainedResources())).toBeEmpty();

      expect(game.inventory.sellResource).toHaveBeenCalledExactlyOnceWith(
        resourceA,
        2,
      );
    });

    it("does not accept resources when full", () => {
      sender.send(resourceA);
      sender.send(resourceB);

      expect(sender.send(resourceA)).toBeFalse();
    });

    it("does not send resources", () => {
      sender.send(resourceA);

      market.update(game, 1);

      expect(target.accept).not.toHaveBeenCalled();
    });

    it("sells resources periodically", () => {
      sender.send(resourceA);
      market.update(game, 1);

      sender.send(resourceA);
      market.update(game, 1);

      expect(market.availableSlotCount).toBe(2);
      expect(Array.from(market.getContainedResources())).toBeEmpty();
      expect(game.inventory.sellResource).toHaveBeenCalledTimes(2);
      expect(game.inventory.sellResource).toHaveBeenCalledWith(resourceA, 1);
    });
  });
});
