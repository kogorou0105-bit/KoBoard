import React, { ReactNode, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { PropertyPanel } from './PropertyPanel';

const SHORTCUTS = [
  { keys: 'Ctrl + Z', action: 'Undo' },
  { keys: 'Ctrl + Shift + Z', action: 'Redo' },
  { keys: 'Ctrl + G', action: 'Group' },
  { keys: 'Ctrl + Shift + G', action: 'Ungroup' },
  { keys: 'Ctrl + C', action: 'Copy' },
  { keys: 'Ctrl + V', action: 'Paste' },
  { keys: 'Delete / Backspace', action: 'Delete' },
  { keys: 'Shift + Drag', action: 'Pan canvas' },
  { keys: 'Ctrl + Drag', action: 'Box select (add)' },
  { keys: 'Scroll wheel', action: 'Zoom' },
  { keys: 'Double-click', action: 'Edit label' },
  { keys: 'Enter', action: 'New line (editing)' },
  { keys: 'Ctrl + Enter', action: 'Confirm edit' },
  { keys: 'Escape', action: 'Cancel edit' },
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



function ToolOptionsBar() {
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

interface ImportModalProps {
  onClose: () => void;
  onLoad: (json: string) => void;
}

function ImportModal({ onClose, onLoad }: ImportModalProps) {
  const [text, setText] = useState('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setText(ev.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Import Scene JSON</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        
        <div className="p-6 flex-1 flex flex-col overflow-hidden gap-4">
           {/* File Upload */}
           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload JSON File</label>
             <input 
               type="file" 
               accept=".json"
               onChange={handleFileChange}
               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
             />
           </div>
           
           <div className="flex items-center gap-4">
             <div className="h-px bg-slate-200 dark:bg-gray-700 flex-1"></div>
             <span className="text-xs text-slate-400 font-medium uppercase">OR Paste JSON</span>
             <div className="h-px bg-slate-200 dark:bg-gray-700 flex-1"></div>
           </div>

           <textarea
             className="flex-1 w-full p-4 font-mono text-xs bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
             placeholder='Paste JSON content here...'
             value={text}
             onChange={e => setText(e.target.value)}
           />
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onLoad(text)}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all"
          >
            Import
          </button>
        </div>
      </div>
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
  const exportPNG = useEditorStore(state => state.exportPNG);
  const exportSVG = useEditorStore(state => state.exportSVG);
  const tool = useEditorStore(state => state.tool);
  const setTool = useEditorStore(state => state.setTool);



  const [importModalOpen, setImportModalOpen] = useState(false);

  const handleLoadClick = () => {
    setImportModalOpen(true);
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      {importModalOpen && (
        <ImportModal onClose={() => setImportModalOpen(false)} onLoad={(json) => {
          try {
            loadJSON(json);
            setImportModalOpen(false);
          } catch (e) {
            alert('Invalid JSON');
          }
        }} />
      )}
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

        {/* Tool Options Bar (when Freehand is active) */}
        <ToolOptionsBar />

        {/* Floating Toolbar (Bottom Center) */}
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
            <button onClick={handleLoadClick} className="relative group w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors">
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
