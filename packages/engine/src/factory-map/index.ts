import type { FactoryUnit } from "../factory-units/abstract/factory-unit";
import { FactoryUnitGrid } from "./unit-grid";
import { FlowGrid } from "./flow-grid";
import type { Point } from "./util/math";

export class FactoryMap {
  private readonly unitGrid = new FactoryUnitGrid();
  private readonly flowGrid = new FlowGrid();

  placeUnit(unit: FactoryUnit, x: number, y: number): boolean {
    return this.unitGrid.placeUnit(unit, x, y);
  }

  removeUnitAt(x: number, y: number): boolean {
    this.deleteFlowBranchAt(x, y);
    return this.unitGrid.removeUnitAt(x, y);
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
      const next = this.flowGrid.getFlowNodeSource(...current);
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
    if (FactoryUnitGrid.isUnitCell(x, y)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      yield this.unitGrid.getUnitAt(x, y)!; // the unit cell in leaves should be non-empty (by flow definition)
      return; // do not traverse further; we've reached a leaf of the current tree
    }

    for (const [targetX, targetY] of this.flowGrid.getFlowNodeTargets(x, y))
      yield* this.getTargetUnits(targetX, targetY);
  }

  addFlowSegment(points: readonly Point[]): boolean {
    FlowGrid.validateFlowSegment(points);

    const startPoint = points[0];
    const startUnit = FactoryUnitGrid.isUnitCell(...startPoint)
      ? this.unitGrid.getUnitAt(...startPoint)
      : undefined;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const endPoint = points.at(-1)!; // the array must contain an ending point
    const endUnit = FactoryUnitGrid.isUnitCell(...endPoint)
      ? this.unitGrid.getUnitAt(...endPoint)
      : undefined;

    // All flow segments must start in either an occupied unit cell or a flow
    // node in a non-unit cell (branching)
    if (!(startUnit || this.flowGrid.getFlowNodeSource(...startPoint)))
      return false;

    if (!endUnit) return false;

    if (!this.flowGrid.addFlowSegment(points)) return false;

    FactoryMap.addTarget(
      // The source is the flow tree root, which is either the start of the flow
      // segment if it's a unit, or the root of the existing flow from which the
      // new segment starts
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      startUnit ?? this.getSourceUnit(...endPoint)!, // TODO: explain
      endUnit,
    );

    return true;
  }

  deleteFlowBranchAt(x: number, y: number): boolean {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const source = this.getSourceUnit(x, y)!, // TODO: explain
      targets = this.getTargetUnits(x, y);

    const success = this.flowGrid.deleteFlowBranchAt(x, y);
    if (success) {
      if (source)
        for (const target of targets) FactoryMap.removeTarget(source, target);
    }
    return success;
  }

  getFlowNodeSource(x: number, y: number): Point | undefined {
    return this.flowGrid.getFlowNodeSource(x, y);
  }

  getFlowNodeTargets(x: number, y: number): readonly Point[] {
    return this.flowGrid.getFlowNodeTargets(x, y);
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
