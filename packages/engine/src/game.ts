import type { Inventory } from "./economy/inventory";
import { FactoryMap } from "./factory-map";

/**
 * Core game loop runner and container for the factory map manager.
 *
 * It acts as a single source of truth for time progression by dispatching
 * {@link GameUpdateEvent}. The speed at which time progresses can be controlled
 * using {@link Game.speed}.
 */
export class Game extends EventTarget {
  readonly factoryMap = new FactoryMap();

  /**
   * The speed of time progression. In-game time intervals are calculated by
   * multiplying actual time intervals by this value.
   */
  speed = 1;

  /**
   * Create a new game instance and start the game loop.
   *
   * @param inventory - The inventory controller for factory units to use for purchases and sales.
   */
  constructor(readonly inventory: Inventory) {
    super();
    this.start();
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  private lastFrameTimestamp: DOMHighResTimeStamp = document.timeline
    .currentTime! as number; // document.timeline is always active

  private frameRequestCallback: FrameRequestCallback = (timestamp) => {
    requestAnimationFrame(this.frameRequestCallback);

    const deltaTime =
      ((timestamp - this.lastFrameTimestamp) * this.speed) / 1000;
    this.lastFrameTimestamp = timestamp;

    this.update(deltaTime);
  };

  /**
   * Main game loop function. Dispatches a {@link GameUpdateEvent} and updates
   * all factory units of the {@link factoryMap}.
   */
  private update(deltaTime: number): void {
    for (const unit of this.factoryMap.getAllUnits())
      unit.update(this, deltaTime);

    this.dispatchEvent(new GameUpdateEvent("update", { deltaTime }));
  }

  /** Start the game loop. */
  private start(): void {
    requestAnimationFrame(this.frameRequestCallback);
  }
}

// Typed events
export interface Game {
  addEventListener<K extends keyof GameEventMap>(
    type: K,
    listener: (this: Game, ev: GameEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<K extends keyof GameEventMap>(
    type: K,
    listener: (this: Game, ev: GameEventMap[K]) => void,
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
