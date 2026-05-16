import { when } from "jest-when";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";
import { Market } from "../../src/factory-units/market";
import type { ResourceKind } from "../../src/resource-kind";
import { UnitMock } from "../util/unit-mock";
import { FactoryMap } from "../../src/factory-map";
import type { Game } from "../../src/game"; // used for mocks

vi.mock("../../src/factory-map");

const resource: ResourceKind = "resource";

describe("Factory units - Market", () => {
  describe("life cycle", () => {
    let game: DeepMockProxy<Game>;

    let market: Market, sender: UnitMock, target: UnitMock;

    beforeEach(() => {
      game = mockDeep<Game>();

      market = new Market(1, 1);

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

    it("accepts and stores resources", () => {
      expect(sender.send(resource)).toBeTrue();

      expect(market.availableSlotCount).toBe(0);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        resource,
      ]);
    });

    it("accepts and sells resources", () => {
      sender.send(resource);

      market.update(game, 0.5);
      expect(Array.from(market.getContainedResources())).toIncludeSameMembers([
        resource,
      ]);
      expect(game.inventory.sellResource).not.toHaveBeenCalled();

      market.update(game, 0.5);
      expect(Array.from(market.getContainedResources())).toBeEmpty();
      expect(game.inventory.sellResource).toHaveBeenCalledExactlyOnceWith(
        resource,
      );
    });

    it("does not accept resources when full", () => {
      sender.send(resource);

      expect(sender.send(resource)).toBeFalse();
    });

    it("does not send resources", () => {
      sender.send(resource);

      market.update(game, 1);

      expect(target.accept).not.toHaveBeenCalled();
    });
  });
});
