import { Inventory } from "./economy/inventory";
import type { Pricing } from "./economy/pricing";
import { Factory } from "./factory";
import type { Renderer } from "./render";

export class Game {
  readonly factory = new Factory();

  readonly inventory: Inventory;

  speed = 1;

  constructor(
    private readonly renderer: Renderer,
    initialBalance: number,
    pricing: Pricing,
  ) {
    this.inventory = new Inventory(initialBalance, pricing);
  }

  private lastFrameTimestamp: DOMHighResTimeStamp = 0;
  private frameRequestCallback: FrameRequestCallback = (timestamp) => {
    requestAnimationFrame(this.frameRequestCallback);

    const deltaTime =
      ((timestamp - this.lastFrameTimestamp) * this.speed) / 1000;
    this.lastFrameTimestamp = timestamp;

    this.update(deltaTime);
    this.render();
  };

  private update(deltaTime: number): void {
    this.factory.update(this, deltaTime);
  }

  private render(): void {
    this.factory.render(this.renderer);
  }

  start(): void {
    this.lastFrameTimestamp = document.timeline.currentTime! as number;
    requestAnimationFrame(this.frameRequestCallback);
  }
}
