export function floorDiv(dividend: number, divisor: number): number {
  return Math.floor(dividend / divisor);
}

export function floorMod(dividend: number, divisor: number): number {
  return ((dividend % divisor) + divisor) % divisor;
}
