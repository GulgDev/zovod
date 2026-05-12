import { FactoryUnitGrid } from "./unit-grid";
import { DirectedGraph } from "./util/directed-graph";
import { dist, type Point } from "./util/math";

export class FlowGrid {
  private readonly graph: DirectedGraph = new DirectedGraph();

  static validateFlowSegment(points: readonly Point[]): void {
    if (points.length < 2)
      throw new Error("Flow segment must have at least 2 points");

    for (let i = 0; i < points.length - 1; ++i) {
      const [x1, y1] = points[i],
        [x2, y2] = points[i + 1];
      if (dist(x1, y1, x2, y2) !== 1)
        throw new Error(`Cannot connect (${x1}, ${y1}) and (${x2}, ${y2})`);

      if (i > 0 && FactoryUnitGrid.isUnitCell(x1, y1))
        throw new Error(
          `Flow segment cannot traverse through a unit cell (${x1}, ${y1})`,
        );
    }
  }

  addFlowSegment(points: readonly Point[]): boolean {
    FlowGrid.validateFlowSegment(points);

    if (
      !FactoryUnitGrid.isUnitCell(...points[0]) &&
      !this.getFlowSource(...points[0])
    )
      return false;

    if (!FactoryUnitGrid.isUnitCell(...points.at(-1)!)) return false;

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

  *getAllFlowSegments(): IterableIterator<readonly Point[]> {
    for (const [x, y] of this.graph.getAllSegmentRoots()) {
      for (const successor of this.graph.getSuccessors(x, y)) {
        const points: Point[] = [[x, y], successor];

        let successors: readonly Point[];
        while (
          (successors = this.graph.getSuccessors(...points.at(-1)!)).length ===
          1
        )
          points.push(successors[0]);

        yield points;
      }
    }
  }
}
