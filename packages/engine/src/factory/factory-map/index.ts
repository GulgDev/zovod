import { FactoryUnit } from "../factory-unit";
import { FactoryUnitGrid } from "./unit-grid";
import { FlowGrid } from "./flow-grid";
import { dist, Point } from "./util/math";

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
      if (unit) source?.removeTarget(unit);
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
      if (!next) break;
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
    for (const [targetX, targetY] of this.flowGrid.getFlowTargets(x, y))
      if (FactoryUnitGrid.isUnitCell(targetX, targetY))
        yield this.unitGrid.getUnitAt(targetX, targetY)!;
      else yield* this.getTargetUnits(targetX, targetY);
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

    (FactoryUnitGrid.isUnitCell(...points[0])
      ? this.unitGrid.getUnitAt(...points[0])
      : this.getSourceUnit(...points[0]))!.addTarget(
      this.unitGrid.getUnitAt(...points.at(-1)!)!,
    );

    return true;
  }

  deleteFlowSegmentAt(x: number, y: number): boolean {
    const source = this.getSourceUnit(x, y)!,
      targets = this.getTargetUnits(x, y);

    const success = this.flowGrid.deleteFlowSegmentAt(x, y);
    if (success) for (const target of targets) source.removeTarget(target);
    return success;
  }

  getFlowSource(x: number, y: number): Point | undefined {
    return this.flowGrid.getFlowSource(x, y);
  }

  getFlowTargets(x: number, y: number): readonly Point[] {
    return this.flowGrid.getFlowTargets(x, y);
  }
}
