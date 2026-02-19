import React, { ReactNode, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { PropertyPanel } from './PropertyPanel';

const SHORTCUTS = [
  { keys: 'Ctrl + Z', action: 'Undo' },
  { keys: 'Ctrl + Shift + Z', action: 'Redo' },
  { keys: 'Ctrl + G', action: 'Group' },
  { keys: 'Ctrl + Shift + G', action: 'Ungroup' },
  { keys: 'Delete / Backspace', action: 'Delete' },
  { keys: 'Shift + Drag', action: 'Pan canvas' },
  { keys: 'Ctrl + Drag', action: 'Box select (add)' },
  { keys: 'Scroll wheel', action: 'Zoom' },
  { keys: 'Double-click', action: 'Edit label' },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300 shadow-sm">
      {children}
    </kbd>
  );
}

function ShortcutHelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-18 left-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-slate-200 dark:border-gray-700 rounded-lg shadow-md text-slate-500 hover:text-slate-800 dark:hover:text-white hover:shadow-lg transition-all text-xs font-medium"
        title="Keyboard Shortcuts"
      >
        <span className="material-symbols-outlined text-[16px]">keyboard</span>
        {open ? 'Hide shortcuts' : 'Shortcuts'}
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 w-[260px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border rounded border-slate-200/80 dark:border-gray-700  shadow-2xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-gray-700/50 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-400">keyboard</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Keyboard Shortcuts</span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            {SHORTCUTS.map(s => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{s.action}</span>
                <div className="flex gap-0.5">
                  {s.keys.split(' + ').map((k, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-[9px] text-slate-300 self-center mx-0.5">+</span>}
                      <Kbd>{k}</Kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const addRect = useEditorStore(state => state.addRect);
  const addText = useEditorStore(state => state.addText);
  const addCircle = useEditorStore(state => state.addCircle);
  const addLine = useEditorStore(state => state.addLine);
  const saveJSON = useEditorStore(state => state.saveJSON);
  const loadJSON = useEditorStore(state => state.loadJSON);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const canUndo = useEditorStore(state => state.canUndo);
  const canRedo = useEditorStore(state => state.canRedo);

  const handleLoad = () => {
    const json = prompt('Paste scene JSON:');
    if (json) {
      try {
        loadJSON(json);
      } catch (e) {
        alert('Invalid JSON!');
        console.error(e);
      }
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Canvas Area (takes remaining space) */}
      <div className="relative flex-1 h-full bg-white dark:bg-[#121121] overflow-hidden group/canvas">
        {/* Keyboard Shortcuts Panel (Bottom Left) */}
        <ShortcutHelpPanel />
        {/* Header Overlay */}
        <header className="absolute top-0 left-0 w-full px-6 py-4 flex justify-between items-start z-50 pointer-events-none">
          {/* Breadcrumbs (Top Left) */}
          <div className="pointer-events-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-slate-200 dark:border-gray-700 px-4 py-2 rounded-full shadow-sm transition-transform hover:scale-105">
            <nav className="flex items-center gap-2">
              <a className="text-slate-500 hover:text-primary transition-colors text-sm font-medium" href="#">Workspace</a>
              <span className="text-slate-400 text-sm font-medium">/</span>
              <span className="text-slate-900 dark:text-white text-sm font-semibold">Project Alpha</span>
            </nav>
          </div>
          
          {/* Collaboration Tools (Top Right) */}
          <div className="pointer-events-auto flex items-center gap-4">
            <button className="flex items-center justify-center rounded-full h-10 px-5 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-wide hover:bg-indigo-700 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 transform active:scale-95">
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Share</span>
            </button>
          </div>
        </header>
        
        {/* Main Board Content */}
        <div className="absolute inset-0 w-full h-full">
           {children}
        </div>

        {/* Floating Toolbar (Bottom Center) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-1 p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-slate-200/60 dark:border-gray-700 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 rounded-full transition-all hover:scale-[1.02]">
            {/* Tool: Select (Active) */}
            <button className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">near_me</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Select (V)</span>
            </button>
            
            {/* Tool: Rectangle */}
            <button onClick={addRect} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">rectangle</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Rectangle (R)</span>
            </button>
            
            {/* Tool: Circle */}
            <button onClick={addCircle} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">circle</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Circle (O)</span>
            </button>
            
            {/* Tool: Text */}
            <button onClick={addText} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">title</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Text (T)</span>
            </button>
            
            {/* Tool: Line */}
            <button onClick={addLine} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px] rotate-45">arrow_right_alt</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Line (L)</span>
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-gray-600 mx-1"></div>
            
            {/* Action: Magic AI */}
            <button className="relative group flex items-center gap-2 pl-3 pr-4 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 transition-all overflow-hidden">
               {/* Shimmer effect */}
               <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
               <span className="material-symbols-outlined text-[20px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
               <span className="relative z-10 whitespace-nowrap">Magic AI</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-gray-600 mx-1"></div>

            {/* Save Button */}
            <button onClick={saveJSON} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">save</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Save (JSON)</span>
            </button>

            {/* Load Button */}
            <button onClick={handleLoad} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Load (JSON)</span>
            </button>
          </div>
        </div>
        
        {/* Zoom Controls (Bottom Right) */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-40">
          <div className="bg-white dark:bg-gray-800 shadow-md border border-slate-100 dark:border-gray-700 rounded-lg p-1 flex flex-col items-center">
            <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded">
               <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
          </div>
        </div>

         {/* Undo/Redo Controls (Bottom Left) */}
         <div className="absolute bottom-8 left-8 z-40">
          <div className="bg-white dark:bg-gray-800 shadow-md border border-slate-100 dark:border-gray-700 rounded-full px-3 py-1.5 flex items-center gap-2">
             <button onClick={undo} disabled={!canUndo} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 transition-opacity">
                 <span className="material-symbols-outlined text-[20px]">undo</span>
             </button>
             <button onClick={redo} disabled={!canRedo} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 transition-opacity">
                 <span className="material-symbols-outlined text-[20px]">redo</span>
             </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Property Panel */}
      <PropertyPanel />
    </div>
  );
};

export default Layout;
