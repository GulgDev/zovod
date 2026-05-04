import { FactoryUnit } from "../factory-unit";
import { FactoryUnitGrid } from "./factory-unit-grid";
import { FlowGrid } from "./flow-grid";
import { Point } from "./util/math";

export class FactoryMap {
  private readonly unitGrid: FactoryUnitGrid = new FactoryUnitGrid();
  private readonly flowGrid: FlowGrid = new FlowGrid();

  placeUnit(unit: FactoryUnit, x: number, y: number): void {
    this.unitGrid.placeUnit(unit, x, y);
  }

  removeUnitAt(x: number, y: number): void {
    const unit = this.unitGrid.getUnitAt(x, y);
    if (unit) this.getSourceUnit(x, y)?.removeTarget(unit);

    this.unitGrid.removeUnitAt(x, y);
    this.flowGrid.deleteFlowSegmentAt(x, y);
  }

  getUnitAt(x: number, y: number): FactoryUnit | undefined {
    return this.unitGrid.getUnitAt(x, y);
  }

  getAllUnits(): IterableIterator<FactoryUnit> {
    return this.unitGrid.getAllUnits();
  }

  private getSourceUnit(x: number, y: number): FactoryUnit | undefined {
    let current: Point | undefined = [x, y];
    do current = this.flowGrid.getFlowSource(...current);
    while (current && !FactoryUnitGrid.isUnitCell(...current));
    return current && this.unitGrid.getUnitAt(...current);
  }

  private *getTargetUnits(x: number, y: number): Generator<FactoryUnit> {
    for (const [targetX, targetY] of this.flowGrid.getFlowTargets(x, y))
      if (FactoryUnitGrid.isUnitCell(targetX, targetY))
        yield this.unitGrid.getUnitAt(targetX, targetY)!;
      else yield* this.getTargetUnits(targetX, targetY);
  }

  addFlowSegment(points: readonly Point[]): boolean {
    if (
      !(
        this.flowGrid.getFlowSource(...points[0]) ||
        (FactoryUnitGrid.isUnitCell(...points[0]) &&
          this.unitGrid.getUnitAt(...points[0]))
      ) ||
      !this.unitGrid.getUnitAt(...points.at(-1)!)
    )
      return false;

    this.flowGrid.addFlowSegment(points);

    (FactoryUnitGrid.isUnitCell(...points[0])
      ? this.unitGrid.getUnitAt(...points[0])
      : this.getSourceUnit(...points[0]))!.addTarget(
      this.unitGrid.getUnitAt(...points.at(-1)!)!,
    );

    return true;
  }

  deleteFlowSegmentAt(x: number, y: number): void {
    const source = this.getSourceUnit(x, y)!;
    for (const target of this.getTargetUnits(x, y)) source.removeTarget(target);

    this.flowGrid.deleteFlowSegmentAt(x, y);
  }

  getFlowSource(x: number, y: number): Point | undefined {
    return this.flowGrid.getFlowSource(x, y);
  }

  getFlowTargets(x: number, y: number): readonly Point[] {
    return this.flowGrid.getFlowTargets(x, y);
  }
}
