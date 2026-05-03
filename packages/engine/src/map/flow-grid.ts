import { FactoryUnitGrid } from "./factory-unit-grid";
import { DirectedGraph } from "./util/directed-graph";
import { Point } from "./util/math";

export class FlowGrid {
  private readonly graph: DirectedGraph = new DirectedGraph();

  addFlowSegment(points: readonly Point[]): void {
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

    for (let i = 0; i < points.length - 2; ++i)
      this.graph.addEdge(...points[i], ...points[i + 1]);
  }

  deleteFlowSegmentAt(x: number, y: number): void {
    let current: Point | undefined = [x, y],
      prev: Point;
    do current = this.graph.getPredecessor(...(prev = current));
    while (
      current &&
      !FactoryUnitGrid.isUnitCell(...current) &&
      this.graph.getSuccessors(...current).length < 2
    );

    this.deleteSubtree(...prev);
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
