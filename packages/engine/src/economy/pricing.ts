import type { ResourceKind } from "../resource-kind";

/**
 * An interface representing the purchase price and the sell price of a
 * purchasable unit.
 *
 * @see {@link Pricing} for primary usage.
 */
export interface Price {
  readonly buy: number;
  readonly sell: number;
}

/**
 * A record containing the purchase/sell prices of workforce units and all
 * resources.
 */
export interface Pricing {
  readonly [key: ResourceKind]: Price;
  readonly workforceUnit: Price;
}
