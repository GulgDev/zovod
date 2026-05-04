import { FactoryUnit } from "./factory-unit";

export class Market extends FactoryUnit {
  constructor(
    readonly slotCount: number,
    readonly sellInterval: number,
  ) {
    super();
  }

  // TODO
}
