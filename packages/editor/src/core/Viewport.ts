export class Viewport {
  // Transformation matrix components: [a, b, c, d, tx, ty]
  // a: scaleX, b: skewY, c: skewX, d: scaleY, tx: translate X, ty: translate Y
  transform: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
  
  // zoom limits
  private minZoom = 0.1;
  private maxZoom = 5.0;

  constructor() {}

  get scale() {
    return this.transform[0];
  }

  get x() {
    return this.transform[4];
  }

  get y() {
    return this.transform[5];
  }

  zoomAt(x: number, y: number, delta: number) {
    const currentScale = this.scale;
    const newScale = Math.min(Math.max(currentScale * delta, this.minZoom), this.maxZoom);
    const scaleFactor = newScale / currentScale;

    // Translate so (x, y) is at origin
    this.transform[4] -= x;
    this.transform[5] -= y;

    // Scale
    this.transform[4] *= scaleFactor;
    this.transform[5] *= scaleFactor;
    this.transform[0] *= scaleFactor;
    this.transform[3] *= scaleFactor;

    // Translate back
    this.transform[4] += x;
    this.transform[5] += y;
  }

  pan(dx: number, dy: number) {
    this.transform[4] += dx;
    this.transform[5] += dy;
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(x: number, y: number) {
    // Inverse transform
    // x' = (x - tx) / a
    // y' = (y - ty) / d
    // Assuming no skew/rotation for now
    return {
      x: (x - this.transform[4]) / this.transform[0],
      y: (y - this.transform[5]) / this.transform[3]
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(x: number, y: number) {
    return {
      x: x * this.transform[0] + this.transform[4],
      y: y * this.transform[3] + this.transform[5]
    };
  }
}
