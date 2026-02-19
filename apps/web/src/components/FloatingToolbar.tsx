import React, { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';

export default function FloatingToolbar() {
  const tool = useEditorStore(s => s.tool);
  const setTool = useEditorStore(s => s.setTool);
  const editor = useEditorStore(s => s.editor);
  
  const addRect = useEditorStore(s => s.addRect);
  const addCircle = useEditorStore(s => s.addCircle);
  const addText = useEditorStore(s => s.addText);
  const addLine = useEditorStore(s => s.addLine);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!editor) return;
    const json = editor.scene.toJSON();
    const str = JSON.stringify(json, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (editor) {
            editor.scene.loadFromJSON(json);
            // Optionally clear selection or reset state
        }
      } catch (err) {
        console.error('Failed to load JSON', err);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    // Reset inputs
    e.target.value = '';
  };

  function ToolbarBtn({ active, icon, title, onClick }: { active?: boolean; icon: string; title: string; onClick: () => void }) {
    return (
      <button 
        onClick={onClick}
        title={title}
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
          ${active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
            : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700 hover:scale-105'
          }
        `}
      >
        <span className="material-symbols-outlined text-[26px]">{icon}</span>
      </button>
    );
  };

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl border border-slate-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2 z-50 transition-all transform hover:scale-[1.02]">
        <ToolbarBtn 
          active={tool === 'select'} 
          onClick={() => setTool('select')} 
          icon="near_me" 
          title="Select (V)" 
        />
        <ToolbarBtn 
          onClick={addRect} 
          icon="check_box_outline_blank" 
          title="Rectangle (R)" 
        />
        <ToolbarBtn 
          onClick={addCircle} 
          icon="radio_button_unchecked" 
          title="Circle (O)" 
        />
        <ToolbarBtn 
          onClick={addLine} 
          icon="show_chart" 
          title="Line (L)" 
        />
        <ToolbarBtn 
          onClick={addText} 
          icon="title" 
          title="Text (T)" 
        />
        <ToolbarBtn 
          active={tool === 'freehand'} 
          onClick={() => setTool('freehand')} 
          icon="edit" 
          title="Pen (P)" 
        />
        
        <div className="w-px h-8 bg-slate-200 dark:bg-gray-700 mx-2" />

        <ToolbarBtn 
          icon="upload_file" 
          title="Load JSON" 
          onClick={handleLoadClick} 
        />
        <ToolbarBtn 
          icon="save" 
          title="Save JSON" 
          onClick={handleSave} 
        />
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange} 
      />
    </>
  );
}
