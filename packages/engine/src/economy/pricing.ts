import { ResourceKind } from "../resource-kind";

export interface Pricing {
  readonly [key: ResourceKind]: { buy: number; sell: number };
  readonly workforceUnit: { buy: number };
}
