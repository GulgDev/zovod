import { dist, packCoords, type Point, unpackCoords } from "./math";

/**
 * A class that stores and manages a directed graph on a 2D square grid, where
 * each node can have at most one predecessor.
 *
 * @internal
 */
export class DirectedGraph {
  private readonly successors = new Map<number, Set<number>>();
  private readonly predecessors = new Map<number, number>();

  /**
   * Create an edge between two cells in von Neumann neighborhood.
   *
   * @throws Will throw if the Manhattan distance between the pair of cells is not 1.
   * @throws Will throw if the successor cell already has a predecessor.
   */
  addEdge(x1: number, y1: number, x2: number, y2: number): void {
    if (dist(x1, y1, x2, y2) !== 1)
      throw new Error(
        `Cannot create an edge between (${x1}, ${y1}) and (${x2}, ${y2})`,
      );

    const keyFrom = packCoords(x1, y1),
      keyTo = packCoords(x2, y2);

    // Trying to add a second incoming edge is an invalid
    // operation and should be checked user-side
    if (this.predecessors.has(keyTo))
      throw new Error(`(${x2}, ${y2}) already has a predecessor`);

    this.predecessors.set(keyTo, keyFrom);
    this.successors.getOrInsertComputed(keyFrom, () => new Set()).add(keyTo);
  }

  /**
   * Delete an edge between two cells.
   *
   * @throws Will throw if there exists no edge between the two specified cells.
   */
  deleteEdge(x1: number, y1: number, x2: number, y2: number): void {
    const key1 = packCoords(x1, y1),
      key2 = packCoords(x2, y2);

    const successors = this.successors.get(key1);
    if (!(successors && successors.delete(key2)))
      throw new Error(
        `No edge exists between (${x1}, ${y1}) and (${x2}, ${y2})`,
      );
    this.predecessors.delete(key2);
  }

  /**
   * Delete a branch (i.e. a subtree along with the edge connecting its root
   * with the parent tree root) recursively.
   *
   * @param treeRoot - The coordinates of the tree root. If set to `undefined`, just the subtree is deleted.
   * @param subtreeRoot - The coordinates of the subtree root.
   */
  deleteBranch(treeRoot: Point | undefined, subtreeRoot: Point): void {
    if (treeRoot) this.deleteEdge(...treeRoot, ...subtreeRoot);

    // Delete the subtree itself
    for (const successor of this.getSuccessors(...subtreeRoot))
      this.deleteBranch(subtreeRoot, successor);
  }

  /**
   * Find the predecessor of a cell/node.
   *
   * @returns A tuple containing the coordinates of the predecessor, or `undefined` if there isn't one.
   */
  getPredecessor(x: number, y: number): Point | undefined {
    const key = this.predecessors.get(packCoords(x, y));
    return key !== undefined ? unpackCoords(key) : undefined;
  }

  /**
   * Find all successors of a cell/node.
   *
   * @returns A read-only array of tuples containing the coordinates of the successors.
   */
  getSuccessors(x: number, y: number): readonly Point[] {
    return Array.from(
      (this.successors.get(packCoords(x, y)) ?? new Map()).keys(),
      unpackCoords,
    );
  }

  /**
   * Finds all nodes/cells that are the roots of directed ears of the graph.
   *
   * @returns An iterator of tuples containing the coordinates of the root cells.
   */
  getAllSegmentRoots(): IterableIterator<Point> {
    return this.successors
      .entries()
      .filter(
        ([key, successors]) =>
          !this.predecessors.has(key) || successors.size >= 2,
      )
      .map(([key]) => unpackCoords(key));
  }
}
