export type Point = readonly [number, number];

export function packCoords(x: number, y: number): number {
  if ((x << 16) >> 16 !== x || (y << 16) >> 16 !== y)
    throw new Error(`Coordinates out of bounds (${x}, ${y})`);

  return (y << 16) | (x & 0xffff);
}

export function unpackCoords(key: number): Point {
  return [
    (key << 16) >> 16, // shift left 16 bits to discard 16 highest bits
    key >> 16,
  ];
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
