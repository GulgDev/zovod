import { ResourceKind } from "../resource-kind";

export interface Pricing {
  [key: ResourceKind]: { buy: number; sell: number };
  workForceUnit: { buy: number };
}
