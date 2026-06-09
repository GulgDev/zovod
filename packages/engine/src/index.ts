export { Game, type GameUpdateEvent } from "./game";
export { Inventory } from "./economy/inventory";

export type { FactoryMap } from "./factory-map";

import { FactoryUnitGrid } from "./factory-map/unit-grid";
export const { isUnitCell: isFactoryUnitCell } = FactoryUnitGrid;

export { FlowBuilder } from "./factory-map/util/flow-builder";

export type { ResourceKind } from "./resource-kind";
export type { Pricing } from "./economy/pricing";

export type { FactoryUnit } from "./factory-units/abstract/factory-unit";
export * from "./factory-units";
