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

export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
