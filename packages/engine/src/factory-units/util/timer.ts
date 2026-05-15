/**
 * An utility class that measures in-game time to trigger repeating or delayed
 * actions.
 *
 * @internal
 */
export class Timer {
  /**
   * @param time - The time in seconds after which the timer will set off.
   */
  constructor(private time = 0) {}

  get expired(): boolean {
    return this.time <= 0;
  }

  /**
   * @param time - The time in seconds after which the timer will set off after reset.
   */
  reset(time: number): void {
    this.time = time;
  }

  /**
   * Advance the timer.
   *
   * @param deltaTime - The amount of time (in seconds) to advance for.
   * @returns `true` if the timer set off during the current advance, `false` otherwise.
   */
  update(deltaTime: number): boolean {
    return this.time > 0 && (this.time -= deltaTime) <= 0;
  }
}
