import type { ResourceKind } from "../../resource-kind";
import { FactoryUnit } from "./factory-unit";

/**
 * An abstract class for factory units that can store a limited amount of
 * resources.
 */
export abstract class ContainerUnit extends FactoryUnit {
  /**
   * A map of resource kinds to the amount of slots occupied by resources of
   * those kinds.
   */
  private resources = new Map<ResourceKind, number>();

  /**
   * @see {@link availableSlotCount}
   */
  private remainingSlots: number;

  /**
   * The amount of slots that are currently available for storing resources.
   */
  get availableSlotCount(): number {
    return this.remainingSlots;
  }

  /**
   * @param slotCount The maximum total amount of resources that the container can store.
   */
  constructor(public readonly slotCount: number) {
    super();
    this.remainingSlots = slotCount;
  }

  /**
   * Retrieve a map of currently stored resource kinds and their respective
   * resource amounts.
   */
  getContainedResources(): ReadonlyMap<ResourceKind, number> {
    return this.resources;
  }

  /**
   * Put the resource in the container's slots.
   *
   * @throws Will throw if the container does not have any available slots.
   */
  protected put(resource: ResourceKind): void {
    if (this.remainingSlots === 0)
      throw new Error("The container is already full");

    --this.remainingSlots;
    this.resources.set(resource, (this.resources.get(resource) ?? 0) + 1);
  }

  /**
   * Remove the resource (one of the specified kind) from the container's slots.
   *
   * @throws Will throw if there is no resource of the specified kind in the container's slots.
   */
  protected drop(resource: ResourceKind): void {
    let count = this.resources.get(resource);
    if (count === undefined) throw new Error("No resource to drop");

    ++this.remainingSlots;
    if (--count === 0)
      this.resources.delete(resource); // don't store 0 in the map
    else this.resources.set(resource, count);
  }

  /**
   * Clear all of the container's slots.
   */
  protected clear(): void {
    this.resources.clear();
    this.remainingSlots = this.slotCount; // reset the remaining slots
  }

  protected canAccept(): boolean {
    return this.availableSlotCount > 0; // can accept any resource if there's still some space left
  }

  protected accept(resource: ResourceKind): void {
    this.put(resource); // put the resource in the container by default
  }
}
