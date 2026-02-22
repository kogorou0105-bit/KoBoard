// ============ Selection Info (Discriminated Union) ============

export interface NoSelectionInfo {
  type: 'none';
}

export interface RectSelectionInfo {
  type: 'rect';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  label: string;
  labelFontSize: number;
  labelColor: string;
  cornerRadius?: number;
}

export interface CircleSelectionInfo {
  type: 'circle';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  label: string;
  labelFontSize: number;
  labelColor: string;
}

export interface TextSelectionInfo {
  type: 'text';
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface LineSelectionInfo {
  type: 'line';
  id: string;
  x: number;
  y: number;
  endX: number;
  endY: number;
  stroke: string;
  lineWidth: number;
  startArrow: boolean;
  endArrow: boolean;
  label: string;
  labelFontSize: number;
  labelColor: string;
}

export interface FreehandSelectionInfo {
  type: 'freehand';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
}

/** A value that may be the same across all selected nodes, or mixed */
export type MixedValue<T> = T | 'mixed';

export interface MultiSelectionInfo {
  type: 'multi';
  count: number;
  ids: string[];
  /** Which node types are in the selection */
  nodeTypes: ('rect' | 'circle' | 'text' | 'line' | 'freehand')[];
  /** Common properties — shown for all selections */
  x: MixedValue<number>;
  y: MixedValue<number>;
  width: MixedValue<number>;
  height: MixedValue<number>;
  /** Shape-only properties (when all selected are shapes) */
  fill?: MixedValue<string>;
  stroke?: MixedValue<string>;
  cornerRadius?: MixedValue<number>;
  /** Text-only properties (when all selected are text) */
  fontSize?: MixedValue<number>;
  color?: MixedValue<string>;
  /** Line-only properties */
  lineWidth?: MixedValue<number>;
}

export type SelectionInfo =
  | NoSelectionInfo
  | RectSelectionInfo
  | CircleSelectionInfo
  | TextSelectionInfo
  | LineSelectionInfo
  | FreehandSelectionInfo
  | MultiSelectionInfo;

// ============ Node Property Update Bag ============

/** Partial bag of all updatable node properties */
export interface NodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  text?: string;
  fontSize?: number;
  color?: string;
  lineWidth?: number;
  label?: string;
  labelFontSize?: number;
  labelColor?: string;
  startArrow?: boolean;
  endArrow?: boolean;
  strokeWidth?: number;
  cornerRadius?: number;
}
