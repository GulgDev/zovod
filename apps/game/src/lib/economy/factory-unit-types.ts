import {
  ProductionPlant,
  Storage,
  type FactoryUnit,
  type Price,
} from "@zovod/engine";

interface FactoryUnitTypeInfo {
  name: string;
  price?: Price;
  create?(): FactoryUnit;
  is(unit: FactoryUnit): boolean;
}

export const factoryUnitTypes: FactoryUnitTypeInfo[] = [
  {
    name: "Хранилище",
    price: { buy: 30, sell: 20 },
    create() {
      return new Storage(10);
    },
    is(unit) {
      return unit instanceof Storage;
    },
  },
  {
    name: "Прядильня",
    price: { buy: 80, sell: 50 },
    create() {
      return new ProductionPlant("cotton", "yarn", 3, 0.05);
    },
    is(unit) {
      return unit instanceof ProductionPlant && unit.producedKind === "yarn";
    },
  },
  {
    name: "Ниточный цех",
    price: { buy: 80, sell: 50 },
    create() {
      return new ProductionPlant("yarn", "threads", 3, 0.05);
    },
    is(unit) {
      return unit instanceof ProductionPlant && unit.producedKind === "threads";
    },
  },
  {
    name: "Ткацкий цех",
    price: { buy: 100, sell: 65 },
    create() {
      return new ProductionPlant("threads", "cloth", 4, 0.04);
    },
    is(unit) {
      return unit instanceof ProductionPlant && unit.producedKind === "cloth";
    },
  },
  {
    name: "Швейная мастерская",
    price: { buy: 120, sell: 80 },
    create() {
      return new ProductionPlant("cloth", "clothing", 2, 0.03);
    },
    is(unit) {
      return (
        unit instanceof ProductionPlant && unit.producedKind === "clothing"
      );
    },
  },
] as const;

export function getFactoryUnitName(unit: FactoryUnit): string | undefined {
  return factoryUnitTypes.find((type) => type.is(unit))?.name;
}
