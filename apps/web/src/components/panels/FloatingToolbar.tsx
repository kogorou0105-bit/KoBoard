import { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

interface FloatingToolbarProps {
  onLoadClick: () => void;
}

export function FloatingToolbar({ onLoadClick }: FloatingToolbarProps) {
  const saveJSON = useEditorStore(state => state.saveJSON);
  const exportPNG = useEditorStore(state => state.exportPNG);
  const exportSVG = useEditorStore(state => state.exportSVG);
  const generateDiagram = useEditorStore(state => state.generateDiagram);
  const tool = useEditorStore(state => state.tool);
  const setTool = useEditorStore(state => state.setTool);

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = () => {
    saveJSON();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000); // Reset after 2s
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-slate-200/60 dark:border-gray-700 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 rounded-full transition-all hover:scale-[1.02]">
        {/* Tool: Select */}
        <button 
          onClick={() => setTool('select')}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            tool === 'select' 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">near_me</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Select (V)</span>
        </button>

        {/* Tool: Pen */}
        <button 
          onClick={() => setTool('freehand')}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            tool === 'freehand' 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">draw</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Pen (P)</span>
        </button>
        
        {/* Tool: Rectangle */}
        <button 
          onClick={() => setTool('rect')}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            tool === 'rect' 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">rectangle</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Rectangle (R)</span>
        </button>
        
        {/* Tool: Circle */}
        <button 
          onClick={() => setTool('circle')}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            tool === 'circle' 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">circle</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Circle (O)</span>
        </button>
        
        {/* Tool: Text */}
        <button 
          onClick={() => setTool('text')}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            tool === 'text' 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">title</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Text (T)</span>
        </button>
        
        {/* Tool: Line */}
        <button 
          onClick={() => setTool('line')}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            tool === 'line' 
              ? 'bg-primary/10 text-primary' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px] rotate-45">arrow_right_alt</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Line (L)</span>
        </button>
        
        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-gray-600 mx-1"></div>
        
        {/* Action: Magic AI */}
        <button 
          onClick={() => generateDiagram('随便传个 prompt，反正是 mock 的')}
          className="relative group flex items-center gap-2 pl-3 pr-4 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 transition-all overflow-hidden"
        >
           {/* Shimmer effect */}
           <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
           <span className="material-symbols-outlined text-[20px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
           <span className="relative z-10 whitespace-nowrap">Magic AI</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-gray-600 mx-1"></div>
        {/* Save Button */}
        <button onClick={handleSave} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className={`material-symbols-outlined text-[22px] transition-all duration-300 ${showSaveSuccess ? 'text-green-500 scale-110' : ''}`}>
            {showSaveSuccess ? 'check_circle' : 'save'}
          </span>
          {showSaveSuccess && (
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded shadow-lg animate-bounce whitespace-nowrap pointer-events-none">
              Copied!
            </span>
          )}
          {!showSaveSuccess && (
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Save (JSON)</span>
          )}
        </button>

        {/* Load Button */}
        <button onClick={onLoadClick} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[22px]">upload_file</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Load (JSON)</span>
        </button>

        {/* Export PNG */}
        <button onClick={exportPNG} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[22px]">image</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Export PNG</span>
        </button>

        {/* Export SVG */}
        <button onClick={exportSVG} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[22px]">code</span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Export SVG</span>
        </button>
      </div>
    </div>
  );
}
