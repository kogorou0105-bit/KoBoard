
import type { MixedValue } from '@koboard/editor';
import { PropRow } from '@/components/ui/PropRow';

export function ColorInput({ label, value, onChange }: { label: string; value: MixedValue<string>; onChange: (v: string) => void }) {
  const isMixed = value === 'mixed';
  const displayValue = isMixed ? '#000000' : value; // Fallback for color picker

  return (
    <PropRow label={label}>
      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7">
           <input
            type="color"
            value={displayValue}
            onChange={e => onChange(e.target.value)}
            className="w-full h-full rounded-md border border-slate-200 dark:border-gray-600 cursor-pointer p-0 opacity-0 absolute inset-0 z-10"
          />
          <div className={`w-full h-full rounded-md border border-slate-200 dark:border-gray-600 flex items-center justify-center ${isMixed ? 'bg-slate-100 dark:bg-slate-700' : ''}`} style={{ backgroundColor: isMixed ? undefined : value }}>
             {isMixed && <span className="text-[10px] text-slate-400 font-bold">?</span>}
          </div>
        </div>
        <input
          type="text"
          value={isMixed ? 'Mixed' : value}
          onChange={e => onChange(e.target.value)}
          className={`flex-1 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-md px-2 py-1 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors ${
            isMixed ? 'text-slate-400 italic' : 'text-slate-800 dark:text-slate-200'
          }`}
        />
      </div>
    </PropRow>
  );
}
