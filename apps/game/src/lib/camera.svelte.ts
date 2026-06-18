import { Tween, type TweenOptions } from "svelte/motion";

interface CameraOffset {
  x: number;
  y: number;
}

export class Camera {
  private readonly offsetTween = new Tween({ x: 0, y: 0 });
  private readonly scaleTween = new Tween(1);

  readonly scale = $derived(this.scaleTween.current);
  readonly offsetX = $derived(this.offsetTween.current.x);
  readonly offsetY = $derived(this.offsetTween.current.y);

  readonly targetScale = $derived(this.scaleTween.target);

  constructor(
    private readonly minScale: number,
    private readonly maxScale: number,
    tweenOptions?: TweenOptions<CameraOffset> & TweenOptions<number>,
  ) {
    this.offsetTween = new Tween<CameraOffset>({ x: 0, y: 0 }, tweenOptions);
    this.scaleTween = new Tween(1, tweenOptions);
  }

  setOffset(
    x: number,
    y: number,
    tweenOptions?: TweenOptions<CameraOffset>,
  ): void {
    this.cleanup?.();
    this.scaleTween.set(this.scale, { duration: 0 });
    this.offsetTween.set({ x, y }, tweenOptions);
  }

  setTransform(
    x: number,
    y: number,
    scale: number,
    tweenOptions?: TweenOptions<CameraOffset> & TweenOptions<number>,
  ): void {
    this.cleanup?.();
    this.scaleTween.set(scale, tweenOptions);
    this.offsetTween.set({ x, y }, tweenOptions);
  }

  /**
   * A cleanup function to unbind offset from scale (used when zooming).
   */
  private cleanup?: () => void;

  zoom(
    scale: number,
    pivotX: number,
    pivotY: number,
    tweenOptions?: TweenOptions<number>,
  ): void {
    scale = Math.max(Math.min(scale, this.maxScale), this.minScale);

    this.cleanup?.();

    const cleanup = $effect.root(() => {
      const startingOffsetX = this.offsetX,
        startingOffsetY = this.offsetY;
      const startingScale = this.scale;

      $effect(() => {
        // Offset the camera so that its pivot point is fixed on the screen
        this.offsetTween.set(
          {
            x:
              pivotX -
              (pivotX - startingOffsetX) * (startingScale / this.scale),
            y:
              pivotY -
              (pivotY - startingOffsetY) * (startingScale / this.scale),
          },
          { duration: 0 },
        );
      });
    });
    this.cleanup = (): void => {
      this.cleanup = undefined;
      cleanup();
    };

    this.scaleTween.set(scale, tweenOptions).then(() => this.cleanup?.());
  }
}
