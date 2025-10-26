export type UpdateFn = (dt: number) => void;

export class FixedStepLoop {
  private readonly update: UpdateFn;
  private readonly step = 1 / 60;
  private running = false;
  private accumulator = 0;
  private lastTime = 0;
  private frame: number | null = null;

  constructor(update: UpdateFn) {
    this.update = update;
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.accumulator = 0;
    this.lastTime = this.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  private tick(time: number) {
    if (!this.running) {
      return;
    }

    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.accumulator += delta;

    // Prevent spiral of death by capping accumulated time
    const maxAccumulation = this.step * 5;
    if (this.accumulator > maxAccumulation) {
      this.accumulator = maxAccumulation;
    }

    while (this.accumulator >= this.step) {
      this.update(this.step);
      this.accumulator -= this.step;
    }

    this.frame = requestAnimationFrame(this.tick);
  }

  private now() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }

    return Date.now();
  }
}
