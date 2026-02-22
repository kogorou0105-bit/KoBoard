import { create } from 'zustand';
import type { Editor, SelectionInfo, NodeProps } from '@koboard/editor';

interface EditorState {
  editor: Editor | null;
  selectionCount: number;
  nodeCount: number;
  canUndo: boolean;
  canRedo: boolean;
  selectionInfo: SelectionInfo;
  selectionBounds: { x: number; y: number; width: number; height: number } | null;
  tool: 'select' | 'freehand' | 'rect' | 'circle' | 'text' | 'line';
  freehandConfig: { stroke: string; strokeWidth: number };
  setEditor: (editor: Editor | null) => void;
  setTool: (tool: 'select' | 'freehand' | 'rect' | 'circle' | 'text' | 'line') => void;
  setFreehandConfig: (config: { stroke?: string; strokeWidth?: number }) => void;
  updateStats: (stats: { selectionCount: number; nodeCount: number }) => void;
  refreshAll: () => void;
  saveJSON: () => void;
  loadJSON: (json: string) => void;
  undo: () => void;
  redo: () => void;
  refreshHistory: () => void;
  updateSelectedNodes: (props: NodeProps) => void;
  deleteSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  moveUp: () => void;
  moveDown: () => void;
  clearAll: () => void;
  alignLeft: () => void;
  alignCenter: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignMiddle: () => void;
  alignBottom: () => void;
  distributeHorizontal: () => void;
  distributeVertical: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  exportPNG: () => void;
  exportSVG: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  editor: null,
  selectionCount: 0,
  nodeCount: 0,
  canUndo: false,
  canRedo: false,
  selectionInfo: { type: 'none' } as SelectionInfo,
  selectionBounds: null,
  tool: 'select',
  freehandConfig: { stroke: '#000000', strokeWidth: 2 },
  setEditor: (editor) => set({ editor }),
  setTool: (tool) => {
    const editor = get().editor;
    if (editor) {
      editor.setTool(tool);
      set({ tool });
    }
  },
  setFreehandConfig: (config) => {
    const editor = get().editor;
    if (editor) {
      editor.setFreehandConfig(config);
      set((state) => ({
        freehandConfig: { ...state.freehandConfig, ...config }
      }));
    }
  },
  updateStats: (stats) => set(stats),
  refreshAll: () => {
    const editor = get().editor;
    if (editor) {
      set({
        canUndo: editor.canUndo(),
        canRedo: editor.canRedo(),
        selectionInfo: editor.getSelectionInfo(),
        selectionBounds: editor.getSelectionScreenBounds(),
        nodeCount: editor.scene.nodes.length,
        selectionCount: editor.scene.nodes.filter(n => n.isSelected).length,
        tool: editor.tool,
      });
    }
  },
  refreshHistory: () => {
    const editor = get().editor;
    if (editor) {
      set({ canUndo: editor.canUndo(), canRedo: editor.canRedo() });
    }
  },
  saveJSON: () => {
    const editor = get().editor;
    if (editor) {
      const json = editor.saveJSON();
      console.log('📦 Scene JSON:', json);
      navigator.clipboard.writeText(json).then(() => {
        console.log('✅ Copied to clipboard!');
      }).catch(() => {
        console.log('⚠️ Could not copy to clipboard');
      });
    }
  },
  loadJSON: (json: string) => {
    const editor = get().editor;
    if (editor) {
      editor.loadJSON(json);
    }
  },
  undo: () => {
    const editor = get().editor;
    if (editor) {
      editor.undo();
      get().refreshAll();
    }
  },
  redo: () => {
    const editor = get().editor;
    if (editor) {
      editor.redo();
      get().refreshAll();
    }
  },
  updateSelectedNodes: (props: NodeProps) => {
    const editor = get().editor;
    if (editor) {
      editor.updateSelectedNodes(props);
    }
  },
  deleteSelected: () => {
    const editor = get().editor;
    if (editor) {
      editor.deleteSelected();
    }
  },
  bringToFront: () => get().editor?.bringToFront(),
  sendToBack: () => get().editor?.sendToBack(),
  moveUp: () => get().editor?.moveUp(),
  moveDown: () => get().editor?.moveDown(),
  clearAll: () => {
    const editor = get().editor;
    if (editor) {
      editor.clearAll();
    }
  },
  alignLeft: () => get().editor?.alignLeft(),
  alignCenter: () => get().editor?.alignCenter(),
  alignRight: () => get().editor?.alignRight(),
  alignTop: () => get().editor?.alignTop(),
  alignMiddle: () => get().editor?.alignMiddle(),
  alignBottom: () => get().editor?.alignBottom(),
  distributeHorizontal: () => get().editor?.distributeHorizontal(),
  distributeVertical: () => get().editor?.distributeVertical(),
  groupSelected: () => get().editor?.groupSelected(),
  ungroupSelected: () => get().editor?.ungroupSelected(),
  exportPNG: () => get().editor?.exportPNG(),
  exportSVG: () => get().editor?.exportSVG(),
}));
