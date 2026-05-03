import { Renderer } from "./render";
import { ResourceKind } from "./resource-kind";

export abstract class FactoryUnit {
  private targetDistribution: Map<FactoryUnit, number> = new Map();

  addTarget(unit: FactoryUnit): void {
    this.targetDistribution.forEach((probability, target) =>
      this.targetDistribution.set(
        target,
        (probability * (this.targetDistribution.size - 1)) /
          this.targetDistribution.size,
      ),
    );
    this.targetDistribution.set(unit, 1 / this.targetDistribution.size);
  }

  removeTarget(unit: FactoryUnit): void {
    this.targetDistribution.delete(unit);
  }

  getTargets(): IterableIterator<FactoryUnit> {
    return this.targetDistribution.keys();
  }

  getTargetProbability(target: FactoryUnit): number {
    if (!this.targetDistribution.has(target)) throw new Error("Invalid target");

    return this.targetDistribution.get(target)!;
  }

  getTargetDistribution(): ReadonlyMap<FactoryUnit, number> {
    return this.targetDistribution;
  }

  setTargetDistribution(distribution: ReadonlyMap<FactoryUnit, number>): void {
    if (
      distribution.size !== this.targetDistribution.size ||
      !Array.from(this.targetDistribution.keys()).every((target) =>
        distribution.has(target),
      )
    )
      throw new Error("The new distribution has invalid target list");

    this.targetDistribution = new Map(distribution);
  }

  update(): void {
    // TODO
  }

  render(renderer: Renderer): void {
    // TODO
  }
}

export class ContainerUnit extends FactoryUnit {
  constructor(slotCount: number) {
    super();
  }
}

export class Plant extends ContainerUnit {
  constructor(
    readonly consumedKind: ResourceKind,
    readonly producedKind: ResourceKind,
    readonly requiredWorkforce: number,
    readonly throughputPerWorker: number,
  ) {
    super(1);
  }
}

export class Storage extends ContainerUnit {
  constructor(slotCount: number) {
    super(slotCount);
  }
}

export class Market extends ContainerUnit {
  constructor(
    slotCount: number,
    readonly sellInterval: number,
  ) {
    super(slotCount);
  }
}
