import { dist, packCoords, type Point, unpackCoords } from "./math";

export class DirectedGraph {
  private readonly successors = new Map<number, Set<number>>();
  private readonly predecessors = new Map<number, number>();

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

  getPredecessor(x: number, y: number): Point | undefined {
    const key = this.predecessors.get(packCoords(x, y));
    return key !== undefined ? unpackCoords(key) : undefined;
  }

  getSuccessors(x: number, y: number): readonly Point[] {
    return Array.from(
      (this.successors.get(packCoords(x, y)) ?? new Map()).keys(),
      unpackCoords,
    );
  }

  getAllSegmentRoots(): IterableIterator<Point> {
    return this.successors
      .entries()
      .filter(
        ([key, successors]) =>
          !this.predecessors.has(key) || successors.size > 2,
      )
      .map(([key]) => unpackCoords(key));
  }
}
