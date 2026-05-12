/** A tuple containing 2D coordinates. */
export type Point = readonly [number, number];

/**
 * Pack two signed 16-bit integers into a single unsigned 32-bit integer.
 *
 * @throws Will throw if the arguments exceed the 16-bit limit.
 *
 * @internal
 */
export function packCoords(x: number, y: number): number {
  if ((x << 16) >> 16 !== x || (y << 16) >> 16 !== y)
    throw new Error(`Coordinates out of bounds (${x}, ${y})`);

  return (y << 16) | (x & 0xffff);
}

/**
 * Unpack two signed 16-bit integers from a single unsigned 32-bit integer.
 *
 * @internal
 */
export function unpackCoords(key: number): Point {
  return [
    (key << 16) >> 16, // shift left 16 bits to discard 16 highest bits
    key >> 16,
  ];
}

/** Calculate the Manhattan distance between two 2D points. */
export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
