import { useRef, useEffect } from 'react';
import { Editor } from '@koboard/editor';
import { useEditorStore } from '../store/useEditorStore';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<Editor | null>(null);
  
  // Store actions
  const updateStats = useEditorStore(state => state.updateStats);
  const nodeCount = useEditorStore(state => state.nodeCount);
  const selectionCount = useEditorStore(state => state.selectionCount);

  useEffect(() => {
    if (canvasRef.current && !editorRef.current) {
      const editor = new Editor(canvasRef.current);
      editorRef.current = editor;
      editor.resize();
      
      // Subscribe to changes
      const unsub = editor.subscribe(() => {
         updateStats({
            nodeCount: editor.scene.nodes.length,
            selectionCount: editor.scene.nodes.filter(n => n.isSelected).length
         });
      });
      
      // Initial stats
      updateStats({
          nodeCount: editor.scene.nodes.length,
          selectionCount: editor.scene.nodes.filter(n => n.isSelected).length
      });

      return () => {
         unsub();
         editor.dispose();
         editorRef.current = null;
      };
    }
  }, [updateStats]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      {/* Toolbar */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        background: 'white', padding: '8px 16px', borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', gap: 8
      }}>
        <button onClick={() => editorRef.current?.addRect()}>Rectangle</button>
        <button onClick={() => editorRef.current?.addText()}>Text</button>
        <span style={{ borderLeft: '1px solid #ddd', paddingLeft: 8, display: 'flex', alignItems: 'center', fontSize: 12, color: '#666' }}>
           Nodes: {nodeCount} | Sel: {selectionCount}
        </span>
      </div>
    </div>
  );
}
