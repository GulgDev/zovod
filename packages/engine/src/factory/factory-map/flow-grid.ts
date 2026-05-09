import { FactoryUnitGrid } from "./unit-grid";
import { DirectedGraph } from "./util/directed-graph";
import type { Point } from "./util/math";

export class FlowGrid {
  private readonly graph: DirectedGraph = new DirectedGraph();

  addFlowSegment(points: readonly Point[]): boolean {
    if (points.length < 2)
      throw new Error("Flow segment must have at least 2 points");

    if (
      !FactoryUnitGrid.isUnitCell(...points[0]) &&
      !this.getFlowSource(...points[0])
    )
      throw new Error(
        `Invalid starting point for the flow segment: (${points[0][0]}, ${points[0][1]})`,
      );

    if (!FactoryUnitGrid.isUnitCell(...points.at(-1)!))
      throw new Error(
        `Invalid ending point for the flow segment: (${points.at(-1)![0]}, ${points.at(-1)![1]})`,
      );

    for (let i = 1; i < points.length; ++i)
      if (this.graph.getPredecessor(...points[i])) return false;

    for (let i = 0; i < points.length - 1; ++i)
      this.graph.addEdge(...points[i], ...points[i + 1]);
    return true;
  }

  deleteFlowSegmentAt(x: number, y: number): boolean {
    if (
      !(
        this.graph.getPredecessor(x, y) ||
        this.graph.getSuccessors(x, y).length > 0
      )
    )
      return false;

    let current: Point | undefined = [x, y],
      prev: Point;
    do current = this.graph.getPredecessor(...(prev = current));
    while (
      current &&
      !FactoryUnitGrid.isUnitCell(...current) &&
      this.graph.getSuccessors(...current).length < 2
    );

    if (current) this.graph.deleteEdge(...current, ...prev);
    this.deleteSubtree(...prev);
    return true;
  }

  private deleteSubtree(x: number, y: number): void {
    for (const [successorX, successorY] of this.graph.getSuccessors(x, y)) {
      this.graph.deleteEdge(x, y, successorX, successorY);
      this.deleteSubtree(successorX, successorY);
    }
  }

  getFlowSource(x: number, y: number): Point | undefined {
    return this.graph.getPredecessor(x, y);
  }

  getFlowTargets(x: number, y: number): readonly Point[] {
    return this.graph.getSuccessors(x, y);
  }
}
