export class Timer {
  constructor(private time = 0) {}

  get expired(): boolean {
    return this.time <= 0;
  }

  reset(time: number): void {
    this.time = time;
  }

  update(deltaTime: number): boolean {
    return this.time > 0 && (this.time -= deltaTime) <= 0;
  }
}
