import { when } from "jest-when";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MockProxy, mock } from "vitest-mock-extended";
import { ProductionPlant } from "../../src/factory-units/production-plant";
import type { ResourceKind } from "../../src/resource-kind";
import { Inventory } from "../../src/economy/inventory";
import { UnitMock } from "../util/unit-mock";
import { FactoryMap } from "../../src/factory-map";
import type { Game } from "../../src/game"; // used for mocks

vi.mock("../../src/economy/inventory");
vi.mock("../../src/factory-map");

const consumedResource: ResourceKind = "consumed",
  producedResource: ResourceKind = "produced";

describe("Factory units - Production plant", () => {
  describe("isWorking", () => {
    it("set to true when the assigned workforce meets the requirment", () => {
      const plant = new ProductionPlant(
        consumedResource,
        producedResource,
        2,
        1,
      );

      vi.mocked(Inventory.getAssignedWorkforce).mockReturnValueOnce(2);
      expect(plant.isWorking).toBeTrue();
    });

    it("set to false when the assigned workforce does not meet the requirment", () => {
      const plant = new ProductionPlant(
        consumedResource,
        producedResource,
        2,
        1,
      );

      vi.mocked(Inventory.getAssignedWorkforce).mockReturnValueOnce(1);
      expect(plant.isWorking).toBeFalse();
    });
  });

  describe("life cycle", () => {
    let game: MockProxy<Game>;

    let plant: ProductionPlant, sender: UnitMock, target: UnitMock;

    beforeEach(() => {
      game = mock<Game>();

      plant = new ProductionPlant(consumedResource, producedResource, 1, 1);

      vi.mocked(Inventory.getAssignedWorkforce).mockReturnValue(1);

      sender = new UnitMock();
      target = new UnitMock();

      when(vi.mocked(FactoryMap.getTargetDistribution))
        .calledWith(sender)
        .mockReturnValue(new Map([[plant, 1]]));

      when(vi.mocked(FactoryMap.getTargetDistribution))
        .calledWith(plant)
        .mockReturnValue(new Map([[target, 1]]));

      target.canAccept.mockReturnValue(true);
    });

    it("accepts a resource of consumed kind and send one of produced kind", () => {
      expect(sender.send(consumedResource)).toBeTrue();

      plant.update(game, 0.5);
      expect(target.accept).not.toHaveBeenCalled();

      plant.update(game, 0.5);
      expect(target.accept).toHaveBeenCalledWith(producedResource);
    });

    it("does not accept a resource of wrong kind", () => {
      expect(sender.send(producedResource)).toBeFalse();
    });

    it("does not accept a resource when not working", () => {
      vi.mocked(Inventory.getAssignedWorkforce).mockReturnValueOnce(0);

      expect(sender.send(consumedResource)).toBeFalse();
    });

    it("does not accept a resource while in process of producing", () => {
      sender.send(consumedResource);

      expect(sender.send(consumedResource)).toBeFalse();

      plant.update(game, 0.5);
      expect(sender.send(consumedResource)).toBeFalse();

      plant.update(game, 0.5);
      expect(sender.send(consumedResource)).toBeTrue();
    });
  });

  describe("remove", async () => {
    // We need the actual FactoryMap for removal logic
    const { FactoryMap } = await vi.importActual<
      typeof import("../../src/factory-map")
    >("../../src/factory-map");

    it("cannot be removed with assigned workforce", () => {
      const map = new FactoryMap();

      const plant = new ProductionPlant(
        consumedResource,
        producedResource,
        1,
        1,
      );
      map.placeUnit(plant, 0, 0);

      vi.mocked(Inventory.getAssignedWorkforce).mockReturnValueOnce(1);
      expect(() => map.removeUnitAt(0, 0)).toThrow();

      vi.mocked(Inventory.getAssignedWorkforce).mockReturnValueOnce(0);
      expect(() => map.removeUnitAt(0, 0)).not.toThrow();
    });
  });
});
