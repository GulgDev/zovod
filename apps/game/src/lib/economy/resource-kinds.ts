import type { Price, ResourceKind } from "@zovod/engine";

interface ResourceKindInfo {
  name: string;
  nameAccusative: string;
  price: Price;
}

export const resourceKinds: Record<ResourceKind, ResourceKindInfo> = {
  cotton: {
    name: "Хлопок",
    nameAccusative: "хлопок",
    price: { buy: 3, sell: 2 },
  },
  yarn: {
    name: "Пряжа",
    nameAccusative: "пряжу",
    price: { buy: 27, sell: 17 },
  },
  threads: {
    name: "Нитки",
    nameAccusative: "нитки",
    price: { buy: 30, sell: 24 },
  },
  cloth: {
    name: "Ткань",
    nameAccusative: "ткань",
    price: { buy: 50, sell: 30 },
  },
  clothing: {
    name: "Одежда",
    nameAccusative: "одежда",
    price: { buy: 300, sell: 210 },
  },
} as const;

export const workforceUnit = {
  name: "Рабочие",
  price: { buy: 5, sell: 3 },
} as const satisfies Omit<ResourceKindInfo, "nameAccusative">;
