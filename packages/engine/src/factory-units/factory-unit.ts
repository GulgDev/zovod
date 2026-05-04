import { Renderer } from "../render";
import { ResourceKind } from "../resource-kind";
import { sampleFrom } from "./util/sample";

export abstract class FactoryUnit {
  private targetDistribution = new Map<FactoryUnit, number>();

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

  abstract canAccept(resource: ResourceKind): boolean;

  accept(resource: ResourceKind): void {
    if (!this.canAccept(resource))
      throw new Error(`Cannot accept resource ${resource}`);

    this.handleResource(resource);
  }

  protected abstract handleResource(resource: ResourceKind): void;

  update(): void {
    // TODO
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: Renderer): void {
    // TODO
  }
}
