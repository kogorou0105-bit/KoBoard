import { SceneNode, RectNode, TextNode, CircleNode, LineNode } from './SceneNode';
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

  render(ctx: CanvasRenderingContext2D) {
    for (const node of this.nodes) {
      node.render(ctx);
    }
  }

  hitTest(x: number, y: number): SceneNode | null {
    // Iterate in reverse (top to bottom)
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      if (this.nodes[i].hitTest(x, y)) {
        return this.nodes[i];
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

