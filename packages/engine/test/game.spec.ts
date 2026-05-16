import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MockProxy, mock, mockDeep } from "vitest-mock-extended";
import { Game, type GameUpdateEvent } from "../src/game";
import type { Inventory } from "../src/economy/inventory";
import { UnitMock } from "./util/unit-mock";
import { mockRAF } from "./util/raf-mock";

describe("Game", () => {
  let inventory: MockProxy<Inventory>;

  let rafMock: Generator<void, void, DOMHighResTimeStamp>;

  beforeEach(() => {
    Object.defineProperty(
      (globalThis.document = mockDeep<Document>()).timeline,
      "currentTime",
      { value: 0, writable: true },
    );

    rafMock = mockRAF(globalThis);
    rafMock.next();

    inventory = mock<Inventory>();
  });

  it("updates the factory units with the corresponding speed", () => {
    const game = new Game(inventory);

    const unit = new UnitMock();
    game.factoryMap.placeUnit(unit, 0, 0);

    rafMock.next(1000);
    expect(unit.doUpdate).toHaveBeenCalledExactlyOnceWith(game, 1);
    unit.doUpdate.mockClear();

    game.speed = 2;

    rafMock.next(2000);
    expect(unit.doUpdate).toHaveBeenCalledExactlyOnceWith(game, 2);
  });

  it("dispatched the update event with the corresponding deltaTime values", () => {
    const game = new Game(inventory);

    const listenerMock = vi.fn<(this: Game, ev: GameUpdateEvent) => void>();
    game.addEventListener("update", listenerMock);

    rafMock.next(1000);
    expect(listenerMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining<Partial<GameUpdateEvent>>({
        deltaTime: 1,
      }),
    );
    listenerMock.mockClear();

    game.speed = 2;

    rafMock.next(2000);
    expect(listenerMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining<Partial<GameUpdateEvent>>({
        deltaTime: 2,
      }),
    );
  });
});
