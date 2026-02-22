
import { useEditorStore } from '@/store/useEditorStore';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { AlignBtn } from '@/components/ui/AlignBtn';
import { Divider } from '@/components/ui/Divider';

export function AlignmentControls() {
  const store = useEditorStore();
  
  return (
    <div className="mb-4">
       <SectionTitle icon="align_horizontal_left" title="Alignment" />
       <div className="flex justify-between mb-2 px-1">
         <AlignBtn icon="align_horizontal_left" title="Align Left" onClick={store.alignLeft} />
         <AlignBtn icon="align_horizontal_center" title="Align Center" onClick={store.alignCenter} />
         <AlignBtn icon="align_horizontal_right" title="Align Right" onClick={store.alignRight} />
         <div className="w-[1px] h-4 bg-slate-200 dark:bg-gray-700 mx-1 self-center" />
         <AlignBtn icon="align_vertical_top" title="Align Top" onClick={store.alignTop} />
         <AlignBtn icon="align_vertical_center" title="Align Middle" onClick={store.alignMiddle} />
         <AlignBtn icon="align_vertical_bottom" title="Align Bottom" onClick={store.alignBottom} />
       </div>
       <div className="flex justify-evenly px-6">
          <AlignBtn icon="space_dashboard" title="Distribute Horizontal" onClick={store.distributeHorizontal} />
          <AlignBtn icon="grid_view" title="Distribute Vertical" onClick={store.distributeVertical} />
       </div>
       <div className="flex gap-2 mt-3 px-1">
         <button
           onClick={store.groupSelected}
           title="Group Selected (set parent)"
           className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
         >
           <span className="material-symbols-outlined text-[16px]">group_work</span>
           Group
         </button>
         <button
           onClick={store.ungroupSelected}
           title="Ungroup Selected (clear parent)"
           className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 transition-colors"
         >
           <span className="material-symbols-outlined text-[16px]">workspaces</span>
           Ungroup
         </button>
       </div>
       <Divider />
    </div>
  );
}
