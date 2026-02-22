
import { useEditorStore } from '@/store/useEditorStore';

export function ToolOptionsBar() {
  const tool = useEditorStore(s => s.tool);
  const config = useEditorStore(s => s.freehandConfig);
  const setConfig = useEditorStore(s => s.setFreehandConfig);

  if (tool !== 'freehand') return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
       <div className="flex items-center gap-3 px-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-slate-200/60 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-full">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="material-symbols-outlined text-[18px] text-indigo-500">draw</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pen</span>
          </div>
          
          <div className="w-px h-4 bg-slate-200 dark:bg-gray-600 mx-0.5" />

          {/* Color */}
          <div className="flex items-center gap-2">
             <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-gray-600 group cursor-pointer shadow-sm ring-2 ring-transparent hover:ring-indigo-500/30 transition-all">
               <input 
                 type="color" 
                 value={config.stroke} 
                 onChange={e => setConfig({ stroke: e.target.value })}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 title="Stroke color"
               />
               <div className="w-full h-full" style={{ backgroundColor: config.stroke }} />
             </div>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-gray-600 mx-0.5" />

          {/* Width */}
          <div className="flex items-center gap-2" title="Stroke width">
             <span className="material-symbols-outlined text-[18px] text-slate-400">line_weight</span>
             <input 
               type="range" 
               min="1" max="20" step="1"
               value={config.strokeWidth} 
               onChange={e => setConfig({ strokeWidth: parseInt(e.target.value) })}
               className="w-24 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
             <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-5 text-right">{config.strokeWidth}</span>
          </div>
       </div>
    </div>
  );
}
