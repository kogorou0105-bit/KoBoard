import {  ReactNode, useState  } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { PropertyPanel } from '@/components/PropertyPanel';
import { ShortcutHelpPanel } from '@/components/panels/ShortcutHelpPanel';
import { ToolOptionsBar } from '@/components/panels/ToolOptionsBar';
import { FloatingToolbar } from '@/components/panels/FloatingToolbar';
import { ImportModal } from '@/components/modals/ImportModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const loadJSON = useEditorStore(state => state.loadJSON);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const canUndo = useEditorStore(state => state.canUndo);
  const canRedo = useEditorStore(state => state.canRedo);
  
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
        <FloatingToolbar onLoadClick={handleLoadClick} />
        
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
