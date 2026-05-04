import { ResourceKind } from "../resource-kind";
import { FactoryUnit } from "./factory-unit";

export class ProductionPlant extends FactoryUnit {
  constructor(
    readonly consumedKind: ResourceKind,
    readonly producedKind: ResourceKind,
    readonly requiredWorkforce: number,
    readonly throughputPerWorker: number,
  ) {
    super();
  }
}
