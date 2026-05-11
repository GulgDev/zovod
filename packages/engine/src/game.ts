import { Inventory } from "./economy/inventory";
import type { Pricing } from "./economy/pricing";
import { FactoryMap } from "./factory-map";

/**
 * Core game loop runner and container for the factory map manager and the
 * inventory controller.
 *
 * It acts as a single source of truth for time progression by dispatching
 * {@link GameUpdateEvent}. The speed at which time progresses can be controlled
 * using {@link Game.speed}.
 */
export class Game extends EventTarget {
  readonly factoryMap = new FactoryMap();

  readonly inventory: Inventory;

  /**
   * The speed of time progression. In-game time intervals are calculated by
   * multiplying actual time intervals by this value.
   */
  speed = 1;

  /**
   * Create a new game instance and start the game loop.
   *
   * @param initialBalance - Initial amount of money that the player has.
   * @param pricing - A record containing buy/sell prices of all reources and workforce units.
   */
  constructor(initialBalance: number, pricing: Pricing) {
    super();
    this.inventory = new Inventory(initialBalance, pricing);
    this.start();
  }

  private lastFrameTimestamp: DOMHighResTimeStamp = 0;
  private frameRequestCallback: FrameRequestCallback = (timestamp) => {
    requestAnimationFrame(this.frameRequestCallback);

    const deltaTime =
      ((timestamp - this.lastFrameTimestamp) * this.speed) / 1000;
    this.lastFrameTimestamp = timestamp;

    this.update(deltaTime);
  };

  /**
   * Main game loop callback.
   *
   * Dispatches a {@link GameUpdateEvent} and updates the factory.
   */
  private update(deltaTime: number): void {
    for (const unit of this.factoryMap.getAllUnits())
      unit.update(this, deltaTime);

    this.dispatchEvent(new GameUpdateEvent("update", { deltaTime }));
  }

  /** Starts the game loop. */
  private start(): void {
    this.lastFrameTimestamp = document.timeline.currentTime! as number;
    requestAnimationFrame(this.frameRequestCallback);
  }
}

export interface Game {
  addEventListener<K extends keyof GameEventMap>(
    type: K,
    listener: (this: Game, ev: GameEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<K extends keyof GameEventMap>(
    type: K,
    listener: (this: Game, ev: GameEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

interface GameEventMap {
  update: GameUpdateEvent;
}

interface GameUpdateEventInit extends EventInit {
  deltaTime: number;
}

/** An event that is fired on each frame by {@link Game}. */
class GameUpdateEvent extends Event {
  /** In-game time in seconds that has elapsed since the last update event. */
  readonly deltaTime: number;

  constructor(type: string, eventInit: GameUpdateEventInit) {
    super(type, eventInit);
    this.deltaTime = eventInit.deltaTime;
  }
}

export type { GameUpdateEvent };
