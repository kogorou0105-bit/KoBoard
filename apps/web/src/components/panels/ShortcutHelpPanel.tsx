import React, { useState } from 'react';
import { Kbd } from '@/components/ui/Kbd';

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

export function ShortcutHelpPanel() {
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
