import { SceneNode } from './SceneNode';

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
}
