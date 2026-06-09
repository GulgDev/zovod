import { beforeEach, vi, type Mock } from "vitest";
import { FactoryMap } from "../../../src/factory-map";

export let map: FactoryMap;

export let unitChangeListener: Mock, flowChangeListener: Mock;

beforeEach(() => {
  map = new FactoryMap();
  map.addEventListener("unitchange", (unitChangeListener = vi.fn()));
  map.addEventListener("flowchange", (flowChangeListener = vi.fn()));
});
