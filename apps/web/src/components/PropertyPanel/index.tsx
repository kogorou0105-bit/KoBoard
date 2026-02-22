
import { useEditorStore } from '@/store/useEditorStore';
import { NoSelectionPanel } from '@/components/PropertyPanel/NoSelectionPanel';
import { ShapePanel } from '@/components/PropertyPanel/ShapePanel';
import { TextPanel } from '@/components/PropertyPanel/TextPanel';
import { LinePanel } from '@/components/PropertyPanel/LinePanel';
import { FreehandPanel } from '@/components/PropertyPanel/FreehandPanel';
import { DefaultFreehandPanel } from '@/components/PropertyPanel/DefaultFreehandPanel';
import { AlignmentControls } from '@/components/PropertyPanel/AlignmentControls';
import { LayerControls } from '@/components/PropertyPanel/LayerControls';
import { ActionBar } from '@/components/PropertyPanel/ActionBar';

export function PropertyPanel() {
  const selectionInfo = useEditorStore(s => s.selectionInfo);
  const clearAll = useEditorStore(s => s.clearAll);
  const nodeCount = useEditorStore(s => s.nodeCount);
  const tool = useEditorStore(s => s.tool);
  const hasSelection = selectionInfo.type !== 'none';

  return (
    <aside className="w-[280px] h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-l border-slate-200/80 dark:border-gray-700 shadow-xl shadow-slate-200/20 dark:shadow-black/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-700/50">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Properties</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {selectionInfo.type === 'none' && (
          tool === 'freehand' 
            ? <DefaultFreehandPanel /> 
            : <NoSelectionPanel />
        )}
        {(selectionInfo.type === 'rect' || selectionInfo.type === 'circle') && <ShapePanel />}
        {selectionInfo.type === 'text' && <TextPanel />}
        {selectionInfo.type === 'line' && <LinePanel />}
        {selectionInfo.type === 'freehand' && <FreehandPanel />}
        {selectionInfo.type === 'multi' && (
          <>
            <div className="border-b border-slate-100 dark:border-gray-700/50 pb-4 mb-4">
               <AlignmentControls />
            </div>
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
               <span className="material-symbols-outlined text-4xl mb-2 opacity-50">select_all</span>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Multiple objects selected</p>
               <p className="text-xs mt-1 opacity-70">Property editing is disabled for multi-selection to avoid accidental changes.</p>
            </div>
          </>
        )}

        {/* Layer controls (shown for any selection) */}
        {hasSelection && <LayerControls />}
        {hasSelection && <ActionBar />}
      </div>

      {/* Footer: Clear All */}
      {nodeCount > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-gray-700/50">
          <button
            onClick={clearAll}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
            Clear All ({nodeCount})
          </button>
        </div>
      )}
    </aside>
  );
}
