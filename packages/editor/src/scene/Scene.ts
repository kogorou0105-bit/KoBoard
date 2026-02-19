import { SceneNode, RectNode, TextNode, CircleNode, LineNode, FreehandNode } from './SceneNode';
import type { AnyNodeData } from './SceneNode';

// ============ Scene Data Schema ============

export interface SceneData {
  nodes: AnyNodeData[];
}

// ============ Scene Class ============

export class Scene {
  nodes: SceneNode[] = [];

  addNode(node: SceneNode) {
    this.nodes.push(node);
  }

  removeNode(id: string) {
    this.nodes = this.nodes.filter(n => n.id !== id);
  }

  render(ctx: CanvasRenderingContext2D, viewBounds?: { minX: number; minY: number; maxX: number; maxY: number }) {
    for (const node of this.nodes) {
      if (viewBounds) {
        // For LineNode, endX/endY may extend beyond x+width/y+height
        const nx = node.x;
        const ny = node.y;
        const nw = node.width;
        const nh = node.height;
        // Compute axis-aligned bounding box (handles negative width/height for lines)
        const nodeMinX = Math.min(nx, nx + nw);
        const nodeMaxX = Math.max(nx, nx + nw);
        const nodeMinY = Math.min(ny, ny + nh);
        const nodeMaxY = Math.max(ny, ny + nh);
        if (nodeMaxX < viewBounds.minX || nodeMinX > viewBounds.maxX ||
            nodeMaxY < viewBounds.minY || nodeMinY > viewBounds.maxY) {
          continue;
        }
      }
      node.render(ctx);
    }
  }

  hitTest(x: number, y: number, viewBounds?: { minX: number; minY: number; maxX: number; maxY: number }): SceneNode | null {
    // Iterate in reverse (top to bottom)
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      if (viewBounds) {
        const nx = node.x;
        const ny = node.y;
        const nw = node.width;
        const nh = node.height;
        const nodeMinX = Math.min(nx, nx + nw);
        const nodeMaxX = Math.max(nx, nx + nw);
        const nodeMinY = Math.min(ny, ny + nh);
        const nodeMaxY = Math.max(ny, ny + nh);
        if (nodeMaxX < viewBounds.minX || nodeMinX > viewBounds.maxX ||
            nodeMaxY < viewBounds.minY || nodeMinY > viewBounds.maxY) {
          continue;
        }
      }
      if (node.hitTest(x, y)) {
        return node;
      }
    }
    return null;
  }

  // ============ Serialization ============

  toJSON(): SceneData {
    return {
      nodes: this.nodes.map(node => node.toJSON()),
    };
  }

  /** In-place load: clears current nodes and rebuilds from data */
  loadFromJSON(data: SceneData) {
    this.nodes = [];
    for (const nodeData of data.nodes) {
      let node: SceneNode | null = null;
      switch (nodeData.type) {
        case 'rect':
          node = RectNode.fromJSON(nodeData);
          break;
        case 'text':
          node = TextNode.fromJSON(nodeData);
          break;
        case 'circle':
          node = CircleNode.fromJSON(nodeData as any);
          break;
        case 'line':
          node = LineNode.fromJSON(nodeData as any);
          break;
        case 'freehand':
          node = FreehandNode.fromJSON(nodeData as any);
          break;
        default:
          console.warn(`Unknown node type: ${(nodeData as any).type}`);
      }
      if (node) {
        this.addNode(node);
      }
    }
  }

  static fromJSON(data: SceneData): Scene {
    const scene = new Scene();
    for (const nodeData of data.nodes) {
      let node: SceneNode | null = null;
      switch (nodeData.type) {
        case 'rect':
          node = RectNode.fromJSON(nodeData);
          break;
        case 'text':
          node = TextNode.fromJSON(nodeData);
          break;
        case 'circle':
          node = CircleNode.fromJSON(nodeData as any);
          break;
        case 'line':
          node = LineNode.fromJSON(nodeData as any);
          break;
        case 'freehand':
          node = FreehandNode.fromJSON(nodeData as any);
          break;
        default:
          console.warn(`Unknown node type: ${(nodeData as any).type}`);
      }
      if (node) {
        scene.addNode(node);
      }
    }
    return scene;
  }
}

