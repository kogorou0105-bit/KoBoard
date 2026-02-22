import {  useState  } from 'react';

export interface ImportModalProps {
  onClose: () => void;
  onLoad: (json: string) => void;
}

export function ImportModal({ onClose, onLoad }: ImportModalProps) {
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
             className="flex-1 w-full min-h-[200px] p-4 font-mono text-xs bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
