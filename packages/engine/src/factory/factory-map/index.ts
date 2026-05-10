import { FactoryUnit } from "../factory-unit";
import { FactoryUnitGrid } from "./unit-grid";
import { FlowGrid } from "./flow-grid";
import { dist, type Point } from "./util/math";

export class FactoryMap {
  private readonly unitGrid = new FactoryUnitGrid();
  private readonly flowGrid = new FlowGrid();

  placeUnit(unit: FactoryUnit, x: number, y: number): boolean {
    return this.unitGrid.placeUnit(unit, x, y);
  }

  removeUnitAt(x: number, y: number): boolean {
    const unit = this.unitGrid.getUnitAt(x, y),
      source = this.getSourceUnit(x, y);

    const success = this.unitGrid.removeUnitAt(x, y);
    if (success) {
      if (unit && source) FactoryMap.removeTarget(source, unit);
      this.flowGrid.deleteFlowSegmentAt(x, y);
    }
    return success;
  }

  getUnitAt(x: number, y: number): FactoryUnit | undefined {
    return this.unitGrid.getUnitAt(x, y);
  }

  getAllUnits(): IterableIterator<FactoryUnit> {
    return this.unitGrid.getAllUnits();
  }

  private getSourceUnit(x: number, y: number): FactoryUnit | undefined {
    let current: Point | undefined = [x, y];
    do {
      const next = this.flowGrid.getFlowSource(...current);
      if (!next) return;
      current = next;
    } while (current && !FactoryUnitGrid.isUnitCell(...current));
    return (
      current &&
      (FactoryUnitGrid.isUnitCell(...current)
        ? this.unitGrid.getUnitAt(...current)
        : undefined)
    );
  }

  private *getTargetUnits(x: number, y: number): Generator<FactoryUnit> {
    if (FactoryUnitGrid.isUnitCell(x, y)) yield this.unitGrid.getUnitAt(x, y)!;

    for (const [targetX, targetY] of this.flowGrid.getFlowTargets(x, y))
      yield* this.getTargetUnits(targetX, targetY);
  }

  addFlowSegment(points: readonly Point[]): boolean {
    for (let i = 0; i < points.length - 1; ++i) {
      const [x1, y1] = points[i],
        [x2, y2] = points[i + 1];
      if (dist(x1, y1, x2, y2) !== 1)
        throw new Error(`Cannot connect (${x1}, ${y1}) and (${x2}, ${y2})`);
    }

    // All flow segments must start in either an occupied unit cell
    // or a (branching) flow node and end in an occupied unit cell
    if (
      !(
        this.flowGrid.getFlowSource(...points[0]) ||
        (FactoryUnitGrid.isUnitCell(...points[0]) &&
          this.unitGrid.getUnitAt(...points[0]))
      ) ||
      !this.unitGrid.getUnitAt(...points.at(-1)!)
    )
      return false;

    if (!this.flowGrid.addFlowSegment(points)) return false;

    FactoryMap.addTarget(
      FactoryUnitGrid.isUnitCell(...points[0])
        ? this.unitGrid.getUnitAt(...points[0])!
        : this.getSourceUnit(...points[0])!,
      this.unitGrid.getUnitAt(...points.at(-1)!)!,
    );

    return true;
  }

  deleteFlowSegmentAt(x: number, y: number): boolean {
    const source = this.getSourceUnit(x, y)!,
      targets = this.getTargetUnits(x, y);

    const success = this.flowGrid.deleteFlowSegmentAt(x, y);
    if (success) {
      if (source)
        for (const target of targets) FactoryMap.removeTarget(source, target);
    }
    return success;
  }

  getFlowSource(x: number, y: number): Point | undefined {
    return this.flowGrid.getFlowSource(x, y);
  }

  getFlowTargets(x: number, y: number): readonly Point[] {
    return this.flowGrid.getFlowTargets(x, y);
  }

  getAllFlowSegments(): IterableIterator<readonly Point[]> {
    return this.flowGrid.getAllFlowSegments();
  }

  private static targetDistributions = new WeakMap<
    FactoryUnit,
    Map<FactoryUnit, number>
  >();

  private static addTarget(unit: FactoryUnit, target: FactoryUnit): void {
    const targetDistribution = this.targetDistributions.getOrInsertComputed(
      unit,
      () => new Map(),
    );
    targetDistribution.forEach((probability, target) =>
      targetDistribution.set(
        target,
        (probability * targetDistribution.size) / (targetDistribution.size + 1),
      ),
    );
    targetDistribution.set(target, 1 / (targetDistribution.size + 1)); // account for empty distribution
  }

  private static removeTarget(unit: FactoryUnit, target: FactoryUnit): void {
    const targetDistribution = this.targetDistributions.get(unit);

    if (!(targetDistribution && targetDistribution.delete(target)))
      throw new Error("Invalid unit target");

    const total = targetDistribution
      .values()
      .reduce((total, probability) => total + probability, 0);
    targetDistribution.forEach((probability, target) =>
      targetDistribution.set(target, probability / total),
    );
  }

  static getTargetDistribution(
    unit: FactoryUnit,
  ): ReadonlyMap<FactoryUnit, number> {
    return this.targetDistributions.get(unit) ?? new Map();
  }

  static setTargetDistribution(
    unit: FactoryUnit,
    distribution: ReadonlyMap<FactoryUnit, number>,
  ): void {
    const total = distribution
      .values()
      .reduce((total, probability) => total + probability, 0);
    if (Math.abs(total - 1) > Number.EPSILON)
      throw new Error("The new distribution is not normalized");

    const targetDistribution = this.getTargetDistribution(unit);
    if (
      distribution.size !== targetDistribution.size ||
      !targetDistribution.keys().every((target) => distribution.has(target))
    )
      throw new Error("The new distribution has invalid target list");

    this.targetDistributions.set(unit, new Map(distribution));
  }
}
