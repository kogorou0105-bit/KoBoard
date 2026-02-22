
import { useEditorStore } from '@/store/useEditorStore';
import { Divider } from '@/components/ui/Divider';

export function ActionBar() {
  const deleteSelected = useEditorStore(s => s.deleteSelected);

  return (
    <>
      <Divider />
      <button
        onClick={deleteSelected}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
        Delete
      </button>
    </>
  );
}
