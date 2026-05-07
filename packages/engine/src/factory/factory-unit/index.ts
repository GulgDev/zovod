import { Renderer } from "../../render";
import { ResourceKind } from "../../resource-kind";
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

  protected abstract canAccept(resource: ResourceKind): boolean;

  protected abstract accept(resource: ResourceKind): void;

  protected send(resource: ResourceKind): boolean {
    const distribution = new Map(
      this.getTargetDistribution()
        .entries()
        .filter(([target]) => target.canAccept(resource)),
    );
    if (distribution.size === 0) return false;

    const target = sampleFrom(distribution);
    target.accept(resource);
    return true;
  }

  protected abstract doUpdate(deltaTime: number): void;

  paused = false;

  update(deltaTime: number): void {
    if (!this.paused) this.doUpdate(deltaTime);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(renderer: Renderer): void {
    // TODO
  }
}
