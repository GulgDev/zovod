import type { FactoryMap } from "..";
import { FactoryUnitGrid } from "../unit-grid";
import { dist, type Point } from "./math";

/**
 * An utility class for building flows (presumably through user mouse input) by
 * drawing lines.
 */
export class FlowBuilder {
  private readonly points: Point[];

  constructor(
    private readonly map: FactoryMap,
    startX: number,
    startY: number,
  ) {
    this.points = [[startX, startY]];
  }

  /**
   * Draw a line from the last point to the target position through non-unit
   * cells using adapted [4-connected Bresenham's line
   * algorithm](https://stackoverflow.com/questions/13542925).
   */
  lineTo(targetX: number, targetY: number): void {
    const i = this.points.findIndex(([x, y]) => x === targetX && y === targetY);
    if (i === -1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let [x, y] = this.points.at(-1)!; // the flow will always contain at least 1 point (the start)

      // If the last point is a unit cell, ignore it
      if (this.points.length > 1) {
        this.points.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [x, y] = this.points.at(-1)!;
      }

      const dx = Math.abs(targetX - x),
        dy = Math.abs(targetY - y);

      const incrementX = Math.sign(targetX - x),
        incrementY = Math.sign(targetY - y);

      let error = 0;
      while (!(x === targetX && y === targetY)) {
        if (Math.abs(error + dy) < Math.abs(error - dx)) {
          // Error will be smaller moving on X
          x += incrementX;
          error += dy;
        } else {
          // Error will be smaller moving on Y
          y += incrementY;
          error -= dx;
        }

        // Don't intersect existing flows
        if (this.map.getFlowNodeSource(x, y) !== undefined) break;

        // Go around unit cells, but ending in a unit cells is allowed
        if (
          FactoryUnitGrid.isUnitCell(x, y) &&
          !(x === targetX && y === targetY)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [x, y] = this.points.at(-1)!; // the point array will always have at least one element (the start)

          // Find the closest available neighbor
          const [closest] = (
            [
              [-1, 0],
              [0, -1],
              [1, 0],
              [0, 1],
            ] as const
          )
            .map(([offsetX, offsetY]) => [x + offsetX, y + offsetY] as const)
            .filter(
              ([neighborX, neighborY]) =>
                !this.map.getFlowNodeSource(neighborX, neighborY) &&
                !FactoryUnitGrid.isUnitCell(neighborX, neighborY) &&
                // Ignore points that are already in the path
                !this.points.some(
                  ([x, y]) => x === neighborX && y === neighborY,
                ),
            )
            .map(
              ([neighborX, neighborY]) =>
                [
                  [neighborX, neighborY],
                  dist(neighborX, neighborY, targetX, targetY),
                ] as const,
            )
            .reduce<readonly [Point | undefined, number]>(
              (
                [closestNeighbor, closestDistance],
                [currentNeighbor, currentDistance],
              ) =>
                currentDistance < closestDistance
                  ? [currentNeighbor, currentDistance]
                  : [closestNeighbor, closestDistance],
              [undefined /* coordinates */, Infinity /* distance */], // closest point
            );
          if (!closest) break;

          [x, y] = closest;
        }

        this.points.push([x, y]);
      }
    } else {
      this.points.splice(i + 1); // if the point is already in the list, simply return to it
    }
  }

  /**
   * Build the flow segment as an array of points.
   */
  build(): readonly Point[] {
    return this.points;
  }
}
