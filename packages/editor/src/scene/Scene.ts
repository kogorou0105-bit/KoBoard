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

  private static createNodeFromJSON(nodeData: any): SceneNode | null {
    switch (nodeData.type) {
      case 'rect':
        return RectNode.fromJSON(nodeData);
      case 'text':
        return TextNode.fromJSON(nodeData);
      case 'circle':
        return CircleNode.fromJSON(nodeData);
      case 'line':
        return LineNode.fromJSON(nodeData);
      case 'freehand':
        return FreehandNode.fromJSON(nodeData);
      default:
        console.warn(`Unknown node type: ${nodeData.type}`);
        return null;
    }
  }

  /** In-place load: clears current nodes and rebuilds from data */
  loadFromJSON(data: SceneData) {
    this.nodes = [];
    for (const nodeData of data.nodes) {
      const node = Scene.createNodeFromJSON(nodeData); // 调用提取出来的公共方法
      if (node) {
        this.addNode(node);
      }
    }
  }

  static fromJSON(data: SceneData): Scene {
    const scene = new Scene();
    scene.loadFromJSON(data); // 直接复用实例方法的逻辑
    return scene;
  }
}
