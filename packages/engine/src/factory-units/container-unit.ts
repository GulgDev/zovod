import { ResourceKind } from "../resource-kind";
import { FactoryUnit } from "./factory-unit";

export abstract class ContainerUnit extends FactoryUnit {
  private slots: ResourceKind[] = [];

  constructor(private readonly slotCount: number) {
    super();
  }

  get availableSlotCount(): number {
    return this.slotCount - this.slots.length;
  }

  protected getContainedResources(): IterableIterator<ResourceKind> {
    return this.slots.values();
  }

  protected put(resource: ResourceKind): void {
    if (this.availableSlotCount === 0)
      throw new Error("The container is already full");
    this.slots.push(resource);
  }

  protected pick(): ResourceKind | undefined {
    return this.slots[0];
  }

  protected drop(resource: ResourceKind): void {
    const i = this.slots.indexOf(resource);
    if (i === -1) throw new Error("No resource to drop");
    this.slots.splice(i, 1);
  }

  protected clear(): void {
    this.slots.length = 0;
  }

  protected canAccept(): boolean {
    return this.availableSlotCount > 0;
  }

  protected accept(resource: ResourceKind): void {
    this.put(resource);
  }
}
