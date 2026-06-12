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
}

export const factoryUnitTypes: FactoryUnitTypeInfo[] = [
  {
    name: "Хранилище",
    price: { buy: 30, sell: 20 },
    create() {
      return new Storage(10);
    },
  },
  {
    name: "Прядильня",
    price: { buy: 80, sell: 50 },
    create() {
      return new ProductionPlant("cotton", "yarn", 3, 0.05);
    },
  },
  {
    name: "Ниточный цех",
    price: { buy: 80, sell: 50 },
    create() {
      return new ProductionPlant("yarn", "threads", 3, 0.05);
    },
  },
  {
    name: "Ткацкий цех",
    price: { buy: 100, sell: 65 },
    create() {
      return new ProductionPlant("threads", "cloth", 4, 0.04);
    },
  },
  {
    name: "Швейная мастерская",
    price: { buy: 120, sell: 80 },
    create() {
      return new ProductionPlant("threads", "cloth", 2, 0.03);
    },
  },
] as const;
