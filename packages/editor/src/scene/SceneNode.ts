// ============ Multi-line Text Utility ============

/** Draw text that supports \n line breaks, centered at (cx, cy) */
function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number, cy: number,
  fontSize: number, color: string
) {
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight / 2;

  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, startY + i * lineHeight);
  }
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
}

/** Draw top-left aligned multi-line text (for TextNode) */
function drawMultilineTextTopLeft(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  fontSize: number, color: string
): { width: number; height: number } {
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.3;

  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  let maxWidth = 0;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
    const m = ctx.measureText(lines[i]);
    if (m.width > maxWidth) maxWidth = m.width;
  }

  return { width: maxWidth, height: lines.length * lineHeight };
}

// ============ Data Schema (Pure JSON interfaces) ============

export interface SceneNodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
}

export interface RectNodeData extends SceneNodeData {
  type: 'rect';
  fill: string;
  stroke: string;
  label?: string;
  labelFontSize?: number;
  labelColor?: string;
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
  label?: string;
  labelFontSize?: number;
  labelColor?: string;
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
  startArrow?: boolean;
  endArrow?: boolean;
  label?: string;
  labelFontSize?: number;
  labelColor?: string;
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
  parentId: string | null = null;

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
  label: string = '';
  labelFontSize: number = 14;
  labelColor: string = '#333333';

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.isSelected ? 2 : 1;
    ctx.stroke();

    // Render centered multi-line label
    if (this.label) {
      drawMultilineText(
        ctx, this.label,
        this.x + this.width / 2, this.y + this.height / 2,
        this.labelFontSize, this.labelColor
      );
    }
  }

  toJSON(): RectNodeData {
    const data: RectNodeData = {
      id: this.id,
      type: 'rect',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
      label: this.label || undefined,
      labelFontSize: this.labelFontSize !== 14 ? this.labelFontSize : undefined,
      labelColor: this.labelColor !== '#333333' ? this.labelColor : undefined,
    };
    if (this.parentId) data.parentId = this.parentId;
    return data;
  }

  static fromJSON(data: RectNodeData): RectNode {
    const node = new RectNode(data.id);
    node.x = data.x;
    node.y = data.y;
    node.width = data.width;
    node.height = data.height;
    node.fill = data.fill;
    node.stroke = data.stroke;
    node.label = data.label ?? '';
    node.labelFontSize = data.labelFontSize ?? 14;
    node.labelColor = data.labelColor ?? '#333333';
    node.parentId = data.parentId ?? null;
    return node;
  }
}

export class TextNode extends SceneNode {
  text: string = 'Hello';
  fontSize: number = 16;
  color: string = '#000000';

  render(ctx: CanvasRenderingContext2D) {
    // Multi-line text rendering
    const dims = drawMultilineTextTopLeft(
      ctx, this.text, this.x, this.y,
      this.fontSize, this.color
    );

    // Update bounding box from actual text metrics
    this.width = dims.width;
    this.height = dims.height;
    
    if (this.isSelected) {
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
  }

  toJSON(): TextNodeData {
    const data: TextNodeData = {
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
    if (this.parentId) data.parentId = this.parentId;
    return data;
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
    node.parentId = data.parentId ?? null;
    return node;
  }
}

export class CircleNode extends SceneNode {
  fill: string = '#ffffff';
  stroke: string = '#000000';
  label: string = '';
  labelFontSize: number = 14;
  labelColor: string = '#333333';

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

    // Render centered multi-line label
    if (this.label) {
      drawMultilineText(ctx, this.label, cx, cy, this.labelFontSize, this.labelColor);
    }
  }

  toJSON(): CircleNodeData {
    const data: CircleNodeData = {
      id: this.id,
      type: 'circle',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
      label: this.label || undefined,
      labelFontSize: this.labelFontSize !== 14 ? this.labelFontSize : undefined,
      labelColor: this.labelColor !== '#333333' ? this.labelColor : undefined,
    };
    if (this.parentId) data.parentId = this.parentId;
    return data;
  }

  static fromJSON(data: CircleNodeData): CircleNode {
    const node = new CircleNode(data.id);
    node.x = data.x;
    node.y = data.y;
    node.width = data.width;
    node.height = data.height;
    node.fill = data.fill;
    node.stroke = data.stroke;
    node.label = data.label ?? '';
    node.labelFontSize = data.labelFontSize ?? 14;
    node.labelColor = data.labelColor ?? '#333333';
    node.parentId = data.parentId ?? null;
    return node;
  }
}

export class LineNode extends SceneNode {
  stroke: string = '#000000';
  lineWidth: number = 2;
  startBinding: LineBinding | null = null;
  endBinding: LineBinding | null = null;
  startArrow: boolean = false;
  endArrow: boolean = true;
  label: string = '';
  labelFontSize: number = 12;
  labelColor: string = '#666666';

  constructor(id: string) {
    super(id);
    this.width = 100;
    this.height = 0;
  }

  get endX() { return this.x + this.width; }
  get endY() { return this.y + this.height; }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.endX, this.endY);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.isSelected ? this.lineWidth + 1 : this.lineWidth;
    ctx.stroke();

    // Draw arrows
    const angle = Math.atan2(this.endY - this.y, this.endX - this.x);
    const arrowLen = this.lineWidth * 4 + 6;
    const arrowAngle = Math.PI / 7;

    if (this.endArrow) {
      this.drawArrow(ctx, this.endX, this.endY, angle, arrowLen, arrowAngle);
    }
    if (this.startArrow) {
      this.drawArrow(ctx, this.x, this.y, angle + Math.PI, arrowLen, arrowAngle);
    }

    // Draw multi-line label at midpoint
    if (this.label) {
      const midX = (this.x + this.endX) / 2;
      const midY = (this.y + this.endY) / 2;

      // Measure for background
      const lines = this.label.split('\n');
      const lineHeight = this.labelFontSize * 1.3;
      ctx.font = `${this.labelFontSize}px sans-serif`;
      let maxW = 0;
      for (const line of lines) {
        const m = ctx.measureText(line);
        if (m.width > maxW) maxW = m.width;
      }
      const totalH = lines.length * lineHeight;
      const pad = 4;

      // Background pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      const bgX = midX - maxW / 2 - pad;
      const bgY = midY - totalH / 2 - pad;
      const bgW = maxW + pad * 2;
      const bgH = totalH + pad * 2;
      const r = 3;
      ctx.moveTo(bgX + r, bgY);
      ctx.lineTo(bgX + bgW - r, bgY);
      ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + r);
      ctx.lineTo(bgX + bgW, bgY + bgH - r);
      ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - r, bgY + bgH);
      ctx.lineTo(bgX + r, bgY + bgH);
      ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - r);
      ctx.lineTo(bgX, bgY + r);
      ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Text (multi-line centered)
      drawMultilineText(ctx, this.label, midX, midY, this.labelFontSize, this.labelColor);
    }

    if (this.isSelected) {
      ctx.fillStyle = '#0066cc';
      for (const [px, py] of [[this.x, this.y], [this.endX, this.endY]]) {
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawArrow(ctx: CanvasRenderingContext2D, tipX: number, tipY: number, angle: number, len: number, spread: number) {
    ctx.fillStyle = this.stroke;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - len * Math.cos(angle - spread), tipY - len * Math.sin(angle - spread));
    ctx.lineTo(tipX - len * Math.cos(angle + spread), tipY - len * Math.sin(angle + spread));
    ctx.closePath();
    ctx.fill();
  }

  hitTest(x: number, y: number): boolean {
    const dx = this.endX - this.x;
    const dy = this.endY - this.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      return Math.hypot(x - this.x, y - this.y) <= 6;
    }
    let t = ((x - this.x) * dx + (y - this.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = this.x + t * dx;
    const py = this.y + t * dy;
    return Math.hypot(x - px, y - py) <= 6;
  }

  toJSON(): LineNodeData {
    const data: LineNodeData = {
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
      startArrow: this.startArrow || undefined,
      endArrow: this.endArrow === false ? false : undefined,
      label: this.label || undefined,
      labelFontSize: this.labelFontSize !== 12 ? this.labelFontSize : undefined,
      labelColor: this.labelColor !== '#666666' ? this.labelColor : undefined,
    };
    if (this.parentId) data.parentId = this.parentId;
    return data;
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
    node.startArrow = data.startArrow ?? false;
    node.endArrow = data.endArrow ?? true;
    node.label = data.label ?? '';
    node.labelFontSize = data.labelFontSize ?? 12;
    node.labelColor = data.labelColor ?? '#666666';
    node.parentId = data.parentId ?? null;
    return node;
  }
}
