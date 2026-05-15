import type { FactoryUnit } from "../factory-units/abstract/factory-unit";
import { FactoryUnitGrid } from "./unit-grid";
import { FlowGrid } from "./flow-grid";
import type { Point } from "./util/math";

/**
 * A class that orchestrates placement and connection of {@link FactoryUnit}
 * instances on a grid, linking the unit management of {@link FactoryUnitGrid}
 * with the flow management of {@link FlowGrid}.
 *
 * The factory grid follows the following recurrent pattern:
 * ```ignore
 *     0   1   2   3
 * 0   #   .   .   .
 *
 * 1   .   .   #   .
 *
 * 2   #   .   .   .
 *
 * 3   .   .   #   .
 * ```
 * The `#` characters there designify unit cells, which can have factory units
 * placed in them. Other cells (`.`) can have flows passing through them. They
 * are used to connect factory units for resource transfer.
 *
 * For example, the following layout connects `(0, 0) -> (2, 1), (0, 2)`:
 * ```ignore
 *     0   1   2   3
 * 0   @   .   .   .
 *     v
 * 1   . > . > @   .
 *     v
 * 2   @   .   .   .
 *
 * 3   .   .   #   .
 * ```
 */
export class FactoryMap {
  private readonly unitGrid = new FactoryUnitGrid();
  private readonly flowGrid = new FlowGrid();

  /**
   * Place a factory unit at the specified position.
   *
   * @throws Will throw if the specified position does not point to a unit cell.
   *
   * @returns `true` if the unit was placed, otherwise `false` if the cell was already occupied by a factory unit.
   *
   * @see {@link FactoryUnitGrid.placeUnit}
   */
  placeUnit(unit: FactoryUnit, x: number, y: number): boolean {
    return this.unitGrid.placeUnit(unit, x, y);
  }

  /**
   * Remove the factory unit at the specified position with its incoming flow
   * branches. It is removed from the target list of its source unit.
   *
   * @throws Will throw if the specified position does not point to a unit cell.
   * @throws Will throw if the unit to be removed is in an invalid state (cannot be removed).
   *
   * @returns `true` if there is a unit placed at that position and it was removed, or `false` if there isn't one.
   *
   * @see {@link FactoryUnitGrid.removeUnitAt}
   */
  removeUnitAt(x: number, y: number): boolean {
    this.deleteFlowBranchAt(x, y);
    return this.unitGrid.removeUnitAt(x, y);
  }

  /**
   * Retrieve the factory unit placed at the specified position.
   *
   * @returns The factory unit placed at the specified position, or `undefined` if there isn't one.
   *
   * @see {@link FactoryUnitGrid.getUnitAt}
   */
  getUnitAt(x: number, y: number): FactoryUnit | undefined {
    return this.unitGrid.getUnitAt(x, y);
  }

  /**
   * Find all factory units placed on the grid.
   *
   * @returns An iterator of all placed factory units.
   *
   * @see {@link FactoryUnitGrid.getAllUnits}
   */
  getAllUnits(): IterableIterator<FactoryUnit> {
    return this.unitGrid.getAllUnits();
  }

  /**
   * Find the factory unit that is the root of the flow tree at the specified
   * position. If a cell position containing a factory unit is passed, the
   * source unit for that target is returned.
   *
   * @throws Will throw if there's no flow tree at the specified position.
   */
  private getSourceUnit(x: number, y: number): FactoryUnit {
    if (!this.flowGrid.getFlowNodeSource(x, y))
      throw new Error("The specified cell is not a part of a flow tree.");

    let current: Point = [x, y];
    do
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      current = this.flowGrid.getFlowNodeSource(...current)!; // only the root flow node can have no source
    while (!FactoryUnitGrid.isUnitCell(...current));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.unitGrid.getUnitAt(...current)!; // we should eventually get to a non-empty unit cell by definition of a flow
  }

  /**
   *
   * @yields
   */
  private *getTargetUnits(x: number, y: number): Generator<FactoryUnit> {
    if (FactoryUnitGrid.isUnitCell(x, y)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      yield this.unitGrid.getUnitAt(x, y)!; // the unit cell in leaves should be non-empty (by flow definition)
      return; // do not traverse further; we've reached a leaf of the current tree
    }

    for (const [targetX, targetY] of this.flowGrid.getFlowNodeTargets(x, y))
      yield* this.getTargetUnits(targetX, targetY);
  }

  /**
   * Add a flow segment from an existing flow to a factory unit, or create a new
   * flow connecting two units. The destination unit cell is added to the
   * source as a target.
   *
   * @param points - The array of points forming the flow segment.
   * @returns `true` if the flow segment was successfully added, otherwise `false` if the flow segment intersects an existing one or has empty unit cells on either ends.
   *
   * @throws Will throw if the flow segment is invalid.
   * @throws Will throw if the starting point is not a unit cell or a part of an existing flow.
   * @throws Will throw if the ending point is not a unit cell.
   *
   * @see {@link FlowGrid.addFlowSegment}
   */
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
      startUnit ?? this.getSourceUnit(...endPoint),
      endUnit,
    );

    return true;
  }

  /**
   * Delete the flow branch placed at the specified point. The flow branch
   * consists of a flow segment along with its successive subtree. The leaf
   * units of that branch are removed from the target list of the flow root
   * unit.
   *
   * @returns `true` if a flow segment exists at the specified position and its corresponding branch was deleted, or `false` if there isn't one.
   *
   * @see {@link FlowGrid.deleteFlowBranchAt}
   */
  deleteFlowBranchAt(x: number, y: number): boolean {
    const source = this.getFlowNodeSource(x, y)
        ? this.getSourceUnit(x, y)
        : undefined, // if the flow node has no source, there is no flow tree to find the source unit for
      targets = this.getTargetUnits(x, y);

    const success = this.flowGrid.deleteFlowBranchAt(x, y);
    if (success) {
      if (source)
        for (const target of targets) FactoryMap.removeTarget(source, target);
    }
    return success;
  }

  /**
   * Find the predecessor of a flow node.
   *
   * @returns The coordinates of the predecessor, or `undefined` if there isn't one.
   *
   * @see {@link FlowGrid.getFlowNodeSource}
   */
  getFlowNodeSource(x: number, y: number): Point | undefined {
    return this.flowGrid.getFlowNodeSource(x, y);
  }

  /**
   * Find all successors of a flow node.
   *
   * @returns An array of successor coordinates.
   *
   * @see {@link FlowGrid.getFlowNodeTargets}
   */
  getFlowNodeTargets(x: number, y: number): readonly Point[] {
    return this.flowGrid.getFlowNodeTargets(x, y);
  }

  /**
   * Find an ear decomposition of the flow graph, i.e. splits every flow into a
   * list of segments &mdash; directed paths of maximal length whose internal
   * vertices have in-degree and out-degree 1 within the flow.
   *
   * @yields The next flow segment as an array of points.
   *
   * @see {@link FlowGrid.getAllFlowSegments}
   */
  *getAllFlowSegments(): Generator<readonly Point[]> {
    yield* this.flowGrid.getAllFlowSegments();
  }

  /**
   * A map of factory maps to their target distributions, i.e. probability
   * tables for targets.
   */
  private static targetDistributions = new WeakMap<
    FactoryUnit,
    Map<FactoryUnit, number>
  >();

  /**
   * Add a new target for the factory unit and initialize its probability to
   * `1 / (N + 1)`, proportionally scaling down the other `N` probabilities in
   * the distribution.
   */
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

  /**
   * Remove the target from the factory unit and scale the distribution
   * probabilities to sum to 1.
   */
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

  /**
   * Retrieve the factory unit's target probability table.
   *
   * @returns A read-only map of target factory units to their corresponding probabilities (from 0 to 1).
   *
   * @see {@link setTargetDistribution}
   */
  static getTargetDistribution(
    unit: FactoryUnit,
  ): ReadonlyMap<FactoryUnit, number> {
    return this.targetDistributions.get(unit) ?? new Map();
  }

  /**
   * Sets the probability table of targets for a factory unit, which determines
   * the distribution of resources sent from it.
   *
   * @param distribution - A map of target factory units to their new probabilities (from 0 to 1).
   *
   * @throws Will throw if the distribution is not normalized (probabilities don't sum to 1).
   * @throws Will throw if the distribution map has keys that are not the unit's targets.
   * @throws Will throw if some of the unit's targets are not included in the new distribution map.
   *
   * @see {@link getTargetDistribution}
   */
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
