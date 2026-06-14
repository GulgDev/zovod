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
    this.scaleTween.set(this.scale, { duration: 0 });
    this.offsetTween.set({ x, y }, tweenOptions);
  }

  setTransform(
    x: number,
    y: number,
    scale: number,
    tweenOptions?: TweenOptions<CameraOffset> & TweenOptions<number>,
  ): void {
    this.scaleTween.set(scale, tweenOptions);
    this.offsetTween.set({ x, y }, tweenOptions);
  }

  zoom(
    scale: number,
    pivotX: number,
    pivotY: number,
    tweenOptions?: TweenOptions<number>,
  ): void {
    scale = Math.max(Math.min(scale, this.maxScale), this.minScale);

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
    this.scaleTween.set(scale, tweenOptions).finally(cleanup);
  }
}
