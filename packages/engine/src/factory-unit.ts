import { Entity } from "./entity";
import { Renderer } from "./render";
import { ResourceKind } from "./resource-kind";

export abstract class FactoryUnit implements Entity {
  constructor(slotCount: number) {}

  update(): void {
    // TODO
  }

  render(renderer: Renderer): void {
    // TODO
  }
}

export class Plant extends FactoryUnit {
  constructor(
    readonly consumedKind: ResourceKind,
    readonly producedKind: ResourceKind,
    readonly requiredWorkforce: number,
    readonly throughputPerWorker: number,
  ) {
    super(1);
  }
}

export class Storage extends FactoryUnit {
  constructor(slotCount: number) {
    super(slotCount);
  }
}

export class Market extends FactoryUnit {
  constructor(
    slotCount: number,
    readonly sellInterval: number,
  ) {
    super(slotCount);
  }
}
