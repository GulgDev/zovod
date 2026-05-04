export function sampleFrom<T>(distribution: ReadonlyMap<T, number>): T {
  if (distribution.size === 0)
    throw new Error("Cannot sample from an empty distribution");

  let threshold =
    Math.random() *
    distribution.values().reduce((total, weight) => total + weight, 0);
  for (const [item, weight] of distribution.entries())
    if ((threshold -= weight) <= 0) return item;

  // After the loop finished, threshold could still be
  // slightly above zero due to floating-point error.
  return Array.from(distribution.keys()).at(-1)!; // Return the last item as a fallback
}
