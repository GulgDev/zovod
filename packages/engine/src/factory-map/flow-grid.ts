import { FactoryUnitGrid } from "./unit-grid";
import { DirectedGraph } from "./util/directed-graph";
import { dist, type Point } from "./util/math";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FactoryMap } from "."; // used in JSDoc

/**
 * A class built on top of {@link DirectedGraph} that manages the flow grid. A
 * **flow** is a tree graph placed on the flow grid that connects a source unit
 * with one or more target units.
 *
 * This class does not handle any factory unit logic, so all the units cells are
 * assumed to valid for flows.
 * @see {@link FactoryMap} for the orchestration layer connecting both unit and flow logic.
 */
export class FlowGrid {
  /** The directed graph storing edges between consecutive flow points. */
  private readonly graph: DirectedGraph = new DirectedGraph();

  /**
   * Validate a flow segment by checking that it is has a start and an end, is
   * continuous, and does not traverse through unit cells.
   *
   * @param points - The array of points forming the flow segment.
   *
   * @throws Will throw if the length of the segment is less than two.
   * @throws Will throw unless the Manhattan distance between each pair of consecutive points is equal to 1.
   * @throws Will throw if the segment traverses through a unit cell.
   */
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

  /**
   * Add a flow segment from an existing flow to a unit cell, or create a new
   * flow connecting two unit cells.
   *
   * It is assumed that both the starting and the ending unit cells are not
   * empty. That should be verified by the caller.
   *
   * @param points - The array of points forming the flow segment.
   * @returns `true` if the flow segment was successfully added, otherwise `false` if the flow segment intersects an existing one
   *
   * @throws Will throw if the flow segment is invalid.
   * @throws Will throw if the starting point is not a unit cell or a part of an existing flow.
   * @throws Will throw if the ending point is not a unit cell.
   *
   * @see {@link validateFlowSegment} for input validation.
   */
  addFlowSegment(points: readonly Point[]): boolean {
    FlowGrid.validateFlowSegment(points);

    /*
    The flow segment must start either in an occupied unit cell or from an
    existing flow. A point is contained in a flow if it has a source, or if it
    is the start of a flow, i.e. a unit cell
    */
    if (
      !(
        FactoryUnitGrid.isUnitCell(...points[0]) ||
        this.getFlowNodeSource(...points[0])
      )
    )
      throw new Error("Invalid flow segment starting point");

    if (!FactoryUnitGrid.isUnitCell(...points.at(-1)!))
      throw new Error("Invalid flow segment ending point");

    // Check for intersection with existing flows
    for (let i = 1; i < points.length; ++i)
      if (this.graph.getPredecessor(...points[i])) return false;

    for (let i = 0; i < points.length - 1; ++i)
      this.graph.addEdge(...points[i], ...points[i + 1]);
    return true;
  }

  /**
   * Delete the flow branch placed at the specified point. The flow branch
   * consists of a flow segment along with its successive subtree.
   *
   * @returns `true` if a flow segment exists at the specified position and its corresponding branch was deleted, or `false` if there isn't one
   */
  deleteFlowBranchAt(x: number, y: number): boolean {
    // Check whether the node is empty
    if (
      !(
        this.graph.getPredecessor(x, y) ||
        this.graph.getSuccessors(x, y).length > 0
      )
    )
      return false;

    let branchStart: Point | undefined = [x, y], // the root of a flow tree containing the branch (either a unit cell or a node with two or more successors)
      subtreeRoot: Point;
    do branchStart = this.graph.getPredecessor(...(subtreeRoot = branchStart));
    while (
      branchStart &&
      !FactoryUnitGrid.isUnitCell(...branchStart) &&
      this.graph.getSuccessors(...branchStart).length < 2
    );

    this.graph.deleteBranch(branchStart, subtreeRoot);
    return true;
  }

  /**
   * Find the predecessor of a flow node.
   *
   * @returns The coordinates of the predecessor, or `undefined` if there isn't one.
   */
  getFlowNodeSource(x: number, y: number): Point | undefined {
    return this.graph.getPredecessor(x, y);
  }

  /**
   * Find all successors of a flow node.
   *
   * @returns An array of successor coordinates.
   */
  getFlowNodeTargets(x: number, y: number): readonly Point[] {
    return this.graph.getSuccessors(x, y);
  }

  /**
   * Finds an ear decomposition of the flow graph, i.e. splits every flow into a
   * list of segments &mdash; directed paths of maximal length whose internal
   * vertices have in-degree and out-degree 1 within the flow.
   *
   * @returns An iterator of flow segment point coordinate arrays.
   */
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
