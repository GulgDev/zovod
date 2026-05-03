export type Point = readonly [number, number];

export function packCoords(x: number, y: number): number {
  if ((x & 0xffff) !== x || (y & 0xffff) !== y)
    throw new Error(`Coordinates out of bounds (${x}, ${y})`);

  return (y << 16) | x;
}

export function unpackCoords(key: number): Point {
  return [key & 0xffff, key >> 16];
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
