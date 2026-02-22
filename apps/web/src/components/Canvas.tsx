import { useRef, useEffect } from 'react';
import { Editor } from '@koboard/editor';
import { useEditorStore } from '@/store/useEditorStore';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<Editor | null>(null);
  
  // Store actions
  const setEditor = useEditorStore(state => state.setEditor);
  const refreshAll = useEditorStore(state => state.refreshAll);

  useEffect(() => {
    if (canvasRef.current && !editorRef.current) {
      const editor = new Editor(canvasRef.current);
      editorRef.current = editor;
      setEditor(editor);
      editor.resize();
      
      // Subscribe to changes — refresh everything in the store
      const unsub = editor.subscribe(() => {
        refreshAll();
      });
      
      // Initial sync
      refreshAll();

      return () => {
         unsub();
         editor.dispose();
         editorRef.current = null;
         setEditor(null);
      };
    }
  }, [setEditor, refreshAll]);

  return (
    <div className="w-full h-full overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
    </div>
  );
}
