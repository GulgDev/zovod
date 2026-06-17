import type { FactoryMap } from "..";
import { FactoryUnitGrid } from "../unit-grid";
import { dist, type Point } from "./math";

/**
 * An utility class for building flows (presumably through user mouse input) by
 * drawing lines.
 */
export class FlowBuilder {
  private readonly currentPoints: Point[];

  /**
   * Array of points that are currently in the path.
   */
  get points(): readonly Point[] {
    return this.currentPoints;
  }

  constructor(
    private readonly map: FactoryMap,
    startX: number,
    startY: number,
  ) {
    this.currentPoints = [[startX, startY]];
  }

  /**
   * Draw a line from the last point to the target position through non-unit
   * cells using adapted [4-connected Bresenham's line
   * algorithm](https://stackoverflow.com/a/27719652).
   */
  lineTo(targetX: number, targetY: number): void {
    const i = this.currentPoints.findIndex(
      ([x, y]) => x === targetX && y === targetY,
    );
    if (i === -1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let [x, y] = this.currentPoints.at(-1)!; // the flow will always contain at least 1 point (the start)

      // If the last point is a unit cell, ignore it
      if (this.currentPoints.length > 1 && FactoryUnitGrid.isUnitCell(x, y)) {
        this.currentPoints.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        [x, y] = this.currentPoints.at(-1)!;
      }

      /** If a cell is invalid, the algorithm will try to go around it. */
      const isValid = (x: number, y: number): boolean =>
        // Ending in a unit cell is valid, but not going through it
        !FactoryUnitGrid.isUnitCell(x, y) || (x === targetX && y === targetY);

      /** If a cell is not available, the algorithm will stop. */
      const isAvailable = (x: number, y: number): boolean =>
        isValid(x, y) &&
        // Don't intersect existing flows
        (this.map.getFlowNodeSource(x, y) === undefined ||
          this.currentPoints.findIndex(
            ([existingX, existingY]) => existingX === x && existingY === y,
          ) !== -1);

      const dx = Math.abs(targetX - x),
        dy = Math.abs(targetY - y);

      const incrementX = Math.sign(targetX - x),
        incrementY = Math.sign(targetY - y);

      function moveX(): void {
        x += incrementX;
        error += dy;
      }

      function moveY(): void {
        y += incrementY;
        error -= dx;
      }

      let error = 0;
      while (!(x === targetX && y === targetY)) {
        if (Math.abs(error + dy) < Math.abs(error - dx)) {
          // Error will be smaller moving on X

          if (isValid(x + incrementX, y)) {
            moveX();
          } else {
            // Try going around unit cells
            const inc = incrementY || 1;
            if (isAvailable(x + incrementX, y + inc)) {
              this.add(x, (y += inc));
              this.add(x + incrementX, y);

              // The current increment becomes invalid, start the
              // procedure from scratch
              // FIXME: this leads to infinite recursion when the target cannot
              // be reached
              return this.lineTo(targetX, targetY);
            } else if (isAvailable(x + incrementX, y - inc)) {
              this.add(x, (y -= inc));
              this.add(x + incrementX, y);
              return this.lineTo(targetX, targetY);
            } else break;
          }
        } else {
          // Error will be smaller moving on Y

          if (isValid(x, y + incrementY)) {
            moveY();
          } else {
            // Try going around unit cells
            const inc = incrementX || 1;
            if (isAvailable(x + inc, y + incrementY)) {
              this.add((x += inc), y);
              this.add(x, y + incrementY);
              return this.lineTo(targetX, targetY);
            } else if (isAvailable(x - incrementX, y)) {
              this.add((x -= inc), y);
              this.add(x, y + incrementY);
              return this.lineTo(targetX, targetY);
            } else break;
          }
        }

        const i = this.currentPoints.findIndex(
          ([existingX, existingY]) => existingX === x && existingY === y,
        );
        if (i === -1) {
          if (!isAvailable(x, y)) break;
          this.currentPoints.push([x, y]);
        } else {
          this.currentPoints.splice(i + 1); // if the point is already in the list, simply return to it
          return this.lineTo(targetX, targetY); // the current error becomes invalid
        }
      }
    } else {
      this.currentPoints.splice(i + 1); // if the point is already in the list, simply return to it
    }
  }

  /**
   * Add a new point to the path or return to an existing one.
   *
   * @throws Will throw if the new point is unreachable from the current path.
   * @throws Will throw if the new point is not available (is a unit cell or already has a flow).
   */
  private add(x: number, y: number): void {
    if (FactoryUnitGrid.isUnitCell(x, y))
      throw new Error(`Cannot go through a unit cell at (${x}, ${y}).`);

    const i = this.currentPoints.findIndex(
      ([existingX, existingY]) => existingX === x && existingY === y,
    );
    if (i === -1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [lastX, lastY] = this.currentPoints.at(-1)!;
      if (dist(x, y, lastX, lastY) !== 1)
        throw new Error(`Cannot reach (${x}, ${y}).`);

      if (this.map.getFlowNodeSource(x, y) !== undefined)
        throw new Error(`A flow already exists at (${x}, ${y}).`);

      this.currentPoints.push([x, y]);
    } else {
      this.currentPoints.splice(i + 1); // if the point is already in the list, simply return to it
    }
  }

  /**
   * Build the flow segment on the map.
   *
   * @returns `true` if the flow segment is valid and was successfully added, `false` otherwise.
   */
  build(): boolean {
    if (this.currentPoints.length < 2) return false;
    return this.map.addFlowSegment(this.currentPoints);
  }
}
