/**
 * Sleeps for the specified time.
 *
 * @param timeMs Time to sleep in milliseconds.
 * @returns Promise to be awaited.
 */
export const sleep = (timeMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, timeMs);
  });

/**
 * Allows to reject an async operation if it takes longer than `timeMs`.
 *
 * For example:
 *
 * ```
 * try {
 *    const value = await timeout(<original-promise>, 500);
 * } catch (error) {
 *   if (error instanceOf TimeoutError) {
 *      // The original promise timeout.
 *   }
 * }
 *
 * ```
 *
 * @param timeMs Time to timeout in milliseconds.
 * @returns Promise to be awaited.
 */
export const timeout = async <T>(
  originalPromise: Promise<T>,
  timeMs: number,
): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`timeout after ${timeMs}ms`));
    }, timeMs);
  });
  return Promise.race([originalPromise, timeoutPromise]);
};

/** Represents a timeout. */
export class TimeoutError extends Error {}

/**
 * Exponential backoff generator useful for retrying a failed request.
 *
 * For example:
 *
 * ```
 * const generator = expBackoffGenerator();
 *
 * generator.next().then(() => {
 *   // retry request.
 * });
 * ```
 */
export async function* expBackoffGenerator(): AsyncGenerator<void, void> {
  let i = 1;
  const maxRandomTimeMs = 100;
  while (true) {
    const waitMs = Math.round(Math.random() * maxRandomTimeMs);
    yield sleep(i + waitMs);
    i *= 2;
  }
}
