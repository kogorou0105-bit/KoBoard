// ============ Data Schema (Pure JSON interfaces) ============

export interface SceneNodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectNodeData extends SceneNodeData {
  type: 'rect';
  fill: string;
  stroke: string;
}

export interface TextNodeData extends SceneNodeData {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
}

export interface CircleNodeData extends SceneNodeData {
  type: 'circle';
  fill: string;
  stroke: string;
}

export interface LineBinding {
  nodeId: string;
  handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
}

export interface LineNodeData extends SceneNodeData {
  type: 'line';
  stroke: string;
  lineWidth: number;
  startBinding?: LineBinding | null;
  endBinding?: LineBinding | null;
}

export type AnyNodeData = RectNodeData | TextNodeData | CircleNodeData | LineNodeData;

// ============ Scene Node Classes ============

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
  abstract toJSON(): AnyNodeData;
  
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

  toJSON(): RectNodeData {
    return {
      id: this.id,
      type: 'rect',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
    };
  }

  static fromJSON(data: RectNodeData): RectNode {
    const node = new RectNode(data.id);
    node.x = data.x;
    node.y = data.y;
    node.width = data.width;
    node.height = data.height;
    node.fill = data.fill;
    node.stroke = data.stroke;
    return node;
  }
}

export class TextNode extends SceneNode {
  text: string = 'Hello';
  fontSize: number = 16;
  color: string = '#000000';

  render(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.fontSize}px sans-serif`;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, this.x, this.y);

    // Always update bounding box from actual text metrics
    const metrics = ctx.measureText(this.text);
    this.width = metrics.width;
    this.height = this.fontSize * 1.2; // line-height approximation
    
    if (this.isSelected) {
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
  }

  toJSON(): TextNodeData {
    return {
      id: this.id,
      type: 'text',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      text: this.text,
      fontSize: this.fontSize,
      color: this.color,
    };
  }

  static fromJSON(data: TextNodeData): TextNode {
    const node = new TextNode(data.id);
    node.x = data.x;
    node.y = data.y;
    node.width = data.width;
    node.height = data.height;
    node.text = data.text;
    node.fontSize = data.fontSize;
    node.color = data.color;
    return node;
  }

  // Override hitTest for text if needed, but rect bounds (set manually) is safer for now
}

export class CircleNode extends SceneNode {
  fill: string = '#ffffff';
  stroke: string = '#000000';

  render(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const rx = this.width / 2;
    const ry = this.height / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();
  }

  toJSON(): CircleNodeData {
    return {
      id: this.id,
      type: 'circle',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
    };
  }

  static fromJSON(data: CircleNodeData): CircleNode {
    const node = new CircleNode(data.id);
    node.x = data.x;
    node.y = data.y;
    node.width = data.width;
    node.height = data.height;
    node.fill = data.fill;
    node.stroke = data.stroke;
    return node;
  }
}

export class LineNode extends SceneNode {
  stroke: string = '#000000';
  lineWidth: number = 2;
  startBinding: LineBinding | null = null;
  endBinding: LineBinding | null = null;

  constructor(id: string) {
    super(id);
    // Default line: 100px long horizontal
    this.width = 100;
    this.height = 0;
  }

  /** End point in world coords */
  get endX() { return this.x + this.width; }
  get endY() { return this.y + this.height; }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.endX, this.endY);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.isSelected ? this.lineWidth + 1 : this.lineWidth;
    ctx.stroke();

    if (this.isSelected) {
      // Draw small circles at endpoints
      ctx.fillStyle = '#0066cc';
      for (const [px, py] of [[this.x, this.y], [this.endX, this.endY]]) {
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  hitTest(x: number, y: number): boolean {
    // Distance from point to line segment
    const dx = this.endX - this.x;
    const dy = this.endY - this.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      // Degenerate: point
      const d = Math.hypot(x - this.x, y - this.y);
      return d <= 6;
    }
    let t = ((x - this.x) * dx + (y - this.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = this.x + t * dx;
    const py = this.y + t * dy;
    const dist = Math.hypot(x - px, y - py);
    return dist <= 6; // 6px tolerance
  }

  toJSON(): LineNodeData {
    return {
      id: this.id,
      type: 'line',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      stroke: this.stroke,
      lineWidth: this.lineWidth,
      startBinding: this.startBinding,
      endBinding: this.endBinding,
    };
  }

  static fromJSON(data: LineNodeData): LineNode {
    const node = new LineNode(data.id);
    node.x = data.x;
    node.y = data.y;
    node.width = data.width;
    node.height = data.height;
    node.stroke = data.stroke;
    node.lineWidth = data.lineWidth;
    node.startBinding = data.startBinding ?? null;
    node.endBinding = data.endBinding ?? null;
    return node;
  }
}
