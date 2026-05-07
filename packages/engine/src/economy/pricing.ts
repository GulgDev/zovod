import { ResourceKind } from "../resource-kind";

export interface Price {
  readonly buy: number;
  readonly sell: number;
}

export interface Pricing {
  readonly [key: ResourceKind]: Price;
  readonly workforceUnit: Price;
}
