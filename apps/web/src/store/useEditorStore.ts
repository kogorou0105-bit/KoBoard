import { create } from 'zustand';

interface EditorState {
  selectionCount: number;
  nodeCount: number;
  updateStats: (stats: { selectionCount: number; nodeCount: number }) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectionCount: 0,
  nodeCount: 0,
  updateStats: (stats) => set(stats),
}));
