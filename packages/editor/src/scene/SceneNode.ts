export abstract class SceneNode {
  id: string;
  x: number = 0;
  y: number = 0;
  width: number = 100;
  height: number = 100;
  isSelected: boolean = false;

  constructor(id: string) {
    this.id = id;
  }

  abstract render(ctx: CanvasRenderingContext2D): void;
  
  hitTest(x: number, y: number): boolean {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }
}

export class RectNode extends SceneNode {
  fill: string = '#ffffff';
  stroke: string = '#000000';

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();
  }
}

export class TextNode extends SceneNode {
  text: string = 'Hello';
  fontSize: number = 16;
  color: string = '#000000';

  render(ctx: CanvasRenderingContext2D) {
    // Basic text rendering
    ctx.font = `${this.fontSize}px sans-serif`;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, this.x, this.y);
    
    if (this.isSelected) {
      const metrics = ctx.measureText(this.text);
      const h = this.fontSize; // Approximation
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x - 2, this.y - 2, metrics.width + 4, h + 4);
    }
  }
  
  // Override hitTest for text if needed, but rect bounds (set manually) is safer for now
}
