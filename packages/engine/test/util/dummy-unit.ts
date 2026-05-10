import { FactoryUnit } from "../../src/factory/factory-unit";

export class DummyUnit extends FactoryUnit {
  constructor(readonly id: unknown) {
    super();
  }

  protected canAccept(): boolean {
    throw new Error("Not implemented");
  }

  protected accept(): void {
    throw new Error("Not implemented");
  }

  protected doUpdate(): void {
    throw new Error("Not implemented");
  }
}
