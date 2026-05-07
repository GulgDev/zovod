import { FactoryMap } from "..";
import { FactoryUnitGrid } from "../unit-grid";
import { dist, Point } from "./math";

export class FlowBuilder {
  private readonly points: Point[];

  constructor(
    private readonly map: FactoryMap,
    startX: number,
    startY: number,
  ) {
    this.points = [[startX, startY]];
  }

  lineTo(targetX: number, targetY: number): void {
    const i = this.points.findIndex(([x, y]) => x === targetX && y === targetY);
    if (i === -1) {
      let [x, y] = this.points.at(-1)!; // the flow will always contain at least 1 point (the start)

      const dx = Math.abs(x - targetX),
        dy = Math.abs(y - targetY);

      const incrementX = Math.sign(x - targetX),
        incrementY = Math.sign(y - targetY);

      let error = 0;
      for (let i = 0; i < dx + dy; ++i) {
        if (Math.abs(error + dy) < Math.abs(error - dx)) {
          // Error will be smaller moving on X
          x += incrementX;
          error += dy;
        } else {
          // Error will be smaller moving on Y
          y += incrementY;
          error -= dx;
        }

        if (this.map.getFlowSource(x, y) !== undefined) break;

        if (FactoryUnitGrid.isUnitCell(x, y)) {
          [x, y] = this.points.at(-1)!;

          const [closest] = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1],
          ]
            .map(([offsetX, offsetY]) => [x + offsetX, y + offsetY])
            .filter(
              ([neighborX, neighborY]) =>
                !this.map.getFlowSource(neighborX, neighborY) &&
                !FactoryUnitGrid.isUnitCell(neighborX, neighborY) &&
                dist(neighborX, neighborY, targetX, targetY) <
                  dist(x, y, targetX, targetY),
            )
            .reduce<[[number, number] | undefined, number]>(
              ([closestNeighbor, closestDistance], [neighborX, neighborY]) => {
                const newDistance = dist(
                  neighborX,
                  neighborY,
                  targetX,
                  targetY,
                );
                return newDistance < closestDistance
                  ? [[neighborX, neighborY], newDistance]
                  : [closestNeighbor, closestDistance];
              },
              [undefined /* coordinates */, Infinity /* distance */], // closest point
            );
          if (!closest) break;

          [x, y] = closest;
        }

        this.points.push([x, y]);
      }
    } else {
      this.points.splice(i + 1);
    }
  }

  build(): readonly Point[] {
    return this.points;
  }
}
