import { Inventory } from "./economy/inventory";
import type { Pricing } from "./economy/pricing";
import { Factory } from "./factory";

export class Game extends EventTarget {
  readonly factory = new Factory();

  readonly inventory: Inventory;

  speed = 1;

  constructor(initialBalance: number, pricing: Pricing) {
    super();
    this.inventory = new Inventory(initialBalance, pricing);
  }

  private lastFrameTimestamp: DOMHighResTimeStamp = 0;
  private frameRequestCallback: FrameRequestCallback = (timestamp) => {
    requestAnimationFrame(this.frameRequestCallback);

    const deltaTime =
      ((timestamp - this.lastFrameTimestamp) * this.speed) / 1000;
    this.lastFrameTimestamp = timestamp;

    this.update(deltaTime);
  };

  private update(deltaTime: number): void {
    this.dispatchEvent(new CustomEvent("update", { detail: deltaTime }));

    this.factory.update(this, deltaTime);
  }

  start(): void {
    this.lastFrameTimestamp = document.timeline.currentTime! as number;
    requestAnimationFrame(this.frameRequestCallback);
  }
}
