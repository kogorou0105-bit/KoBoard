
import { useEditorStore } from '@/store/useEditorStore';

export function NoSelectionPanel() {
  const nodeCount = useEditorStore(s => s.nodeCount);
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-gray-600 mb-3">touch_app</span>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">No selection</p>
      <p className="text-xs text-slate-300 dark:text-slate-600">
        {nodeCount > 0 ? `${nodeCount} objects on canvas` : 'Click a tool to add shapes'}
      </p>
    </div>
  );
}
