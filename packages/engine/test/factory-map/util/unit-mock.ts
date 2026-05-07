import { FactoryUnit } from "../../../src/factory/factory-unit";

export class UnitMock extends FactoryUnit {
  protected canAccept(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected accept(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected doUpdate(): void {}
}
