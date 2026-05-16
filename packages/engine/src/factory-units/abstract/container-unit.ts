import type { ResourceKind } from "../../resource-kind";
import { FactoryUnit } from "./factory-unit";

/**
 * An abstract class for factory units that can store a limited amount of
 * resources.
 */
export abstract class ContainerUnit extends FactoryUnit {
  /**
   * An array of stored resources.
   */
  private slots: ResourceKind[] = [];

  constructor(private readonly slotCount: number) {
    super();
  }

  get availableSlotCount(): number {
    return this.slotCount - this.slots.length;
  }

  /**
   * Retrieve all resources currently stored.
   *
   * @returns An iterator of resource kinds.
   */
  getContainedResources(): IterableIterator<ResourceKind> {
    return this.slots.values();
  }

  /**
   * Put the resource in the container's slots.
   *
   * @throws Will throw if the container does not have any available slots.
   */
  protected put(resource: ResourceKind): void {
    if (this.availableSlotCount === 0)
      throw new Error("The container is already full");
    this.slots.push(resource);
  }

  /**
   * Pick a random resource from the container's slots.
   *
   * @returns An arbitrarily chosen resource or `undefined` if the container is empty.
   */
  protected pick(): ResourceKind | undefined {
    return this.slots[0];
  }

  /**
   * Remove the resource (one of the specified kind) from the container's slots.
   *
   * @throws Will throw if there is no resource of the specified kind in the container's slots.
   */
  protected drop(resource: ResourceKind): void {
    const i = this.slots.indexOf(resource);
    if (i === -1) throw new Error("No resource to drop");
    this.slots.splice(i, 1);
  }

  /**
   * Clear all of the container's slots.
   */
  protected clear(): void {
    this.slots.length = 0;
  }

  protected canAccept(): boolean {
    return this.availableSlotCount > 0; // can accept any resource if there's still some space left
  }

  protected accept(resource: ResourceKind): void {
    this.put(resource); // put the resource in the container by default
  }
}
