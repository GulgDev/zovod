import { vi } from "vitest";
import { FactoryUnit } from "../../src/factory/factory-unit";
import type { ResourceKind } from "../../src/resource-kind";

export class UnitMock extends FactoryUnit {
  constructor(readonly id: unknown) {
    super();
  }

  canAccept = vi.fn();
  accept = vi.fn();
  doUpdate = vi.fn();

  override send(resource: ResourceKind): boolean {
    return super.send(resource);
  }
}
