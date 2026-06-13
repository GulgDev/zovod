import type { ResourceKind } from "@zovod/engine";

interface ResourceKindInfo {
  name: string;
  nameAccusative: string;
}

export const resourceKinds: Record<ResourceKind, ResourceKindInfo> = {
  cotton: { name: "Хлопок", nameAccusative: "хлопок" },
  yarn: { name: "Пряжа", nameAccusative: "пряжу" },
  threads: { name: "Нитки", nameAccusative: "нитки" },
  cloth: { name: "Ткань", nameAccusative: "ткань" },
  clothing: { name: "Одежда", nameAccusative: "одежда" },
} as const;
