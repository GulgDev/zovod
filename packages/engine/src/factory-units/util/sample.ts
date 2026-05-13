export function sampleFrom<T>(distribution: ReadonlyMap<T, number>): T {
  if (distribution.size === 0)
    throw new Error("Cannot sample from an empty distribution");

  let threshold =
    Math.random() *
    distribution.values().reduce((total, weight) => total + weight, 0);
  for (const [item, weight] of distribution.entries())
    if ((threshold -= weight) <= 0) return item;

  // After the loop finished, threshold could still be slightly above zero due
  // to floating-point error, so return the last item as fallback.

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Array.from(distribution.keys()).at(-1)!; // the distribution is not empty
}
