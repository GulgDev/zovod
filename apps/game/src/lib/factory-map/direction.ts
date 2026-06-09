export const DIRECTION = {
  N: 0,
  E: 1,
  S: 2,
  W: 3,
} as const;

export const UNIT_VECTORS = {
  [DIRECTION.N]: [0, -1],
  [DIRECTION.E]: [1, 0],
  [DIRECTION.S]: [0, 1],
  [DIRECTION.W]: [-1, 0],
} as const;

export function directionFrom(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Direction {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dy === -1) return DIRECTION.N;
  if (dx === 1) return DIRECTION.E;
  if (dy === 1) return DIRECTION.S;
  if (dx === -1) return DIRECTION.W;
  throw new Error("Coordinates must be in the Manhattan distance of 1.");
}

export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
