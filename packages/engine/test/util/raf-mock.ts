/**
 * Create a new requestAnimationFrame mock context and apply it to the specified
 * global object.
 *
 * This function is a generator that runs the scheduled callbacks for every
 * `.next()` call. The argument passed to `.next()` is used as the timestamp for
 * the callbacks.
 *
 * Because generators only start after the first `.next()` call, you need to
 * advance the generator once in order to apply the mocks.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DedicatedWorkerGlobalScope/requestAnimationFrame)
 */
export function* mockRAF(
  global: typeof globalThis,
): Generator<void, void, DOMHighResTimeStamp> {
  const requestAnimationFrameMock: typeof requestAnimationFrame = (callback) =>
    callbacks.push(callback);

  const cancelAnimationFrameMock: typeof cancelAnimationFrame = (handle) =>
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete callbacks[handle - 1];

  global.requestAnimationFrame = requestAnimationFrameMock;
  global.cancelAnimationFrame = cancelAnimationFrameMock;

  const callbacks: FrameRequestCallback[] = [];

  for (;;) {
    const timestamp = yield;
    callbacks.forEach((callback, index) => {
      callback(timestamp);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete callbacks[index];
    });
  }
}
