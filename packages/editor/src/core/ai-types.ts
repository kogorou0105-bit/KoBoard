// AI 生成的节点定义
export interface AIGeneratedNode {
  type: 'node';
  id: string;      // 例如: "n1"
  label: string;   // 例如: "开始结账"
  shape?: 'rect' | 'circle'; // 默认为 rect
}

// AI 生成的连线定义
export interface AIGeneratedEdge {
  type: 'edge';
  id: string;      // 例如: "e1"
  source: string;  // 起点节点ID
  target: string;  // 终点节点ID
  label?: string;  // 例如: "是" / "否"
}

export type AIGeneratedItem = AIGeneratedNode | AIGeneratedEdge;
