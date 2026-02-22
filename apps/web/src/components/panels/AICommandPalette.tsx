import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function AICommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const generateDiagram = useEditorStore(state => state.generateDiagram);

  // Global shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    // Execute generation
    // Since our stream logic is fire-and-forget for now, we close modal aggressively
    // but in a more robust flow we might wait for the stream to complete
    generateDiagram(prompt.trim());
    
    // Slight delay to allow visually seeing it start
    setTimeout(() => {
      setPrompt('');
      setIsOpen(false);
      setIsGenerating(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[20vh] transition-all"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <form onSubmit={handleSubmit} className="relative flex items-center p-2">
          {/* Sparkle Icon */}
          <div className="absolute left-6 text-indigo-500">
            {isGenerating ? (
               <span className="material-symbols-outlined text-3xl animate-spin text-purple-500">sync</span>
            ) : (
               <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "AI is drawing..." : "Describe a diagram, flowchart, or idea..."}
            className="w-full h-16 pl-16 pr-24 bg-transparent text-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none disabled:opacity-50"
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={!prompt.trim() || isGenerating}
            className={
              "absolute right-4 px-4 py-2 rounded-lg font-medium text-sm transition-all " +
              (prompt.trim() && !isGenerating 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700" 
                : "bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500")
            }
          >
            Generate
            <span className="hidden sm:inline ml-2 text-xs opacity-70 border border-current rounded px-1 pb-0.5">↵</span>
          </button>
        </form>

        <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800/50 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 dark:border-gray-700 rounded px-1">↑↓</span> to navigate (coming soon)
            </span>
            <span className="flex items-center gap-1">
              <span className="border border-slate-200 dark:border-gray-700 rounded px-1">esc</span> to close
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            Powered by KoBoard AI
          </div>
        </div>
      </div>
    </div>
  );
}
