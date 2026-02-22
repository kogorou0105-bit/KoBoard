
import type { MixedValue } from '@koboard/editor';
import { PropRow } from '@/components/ui/PropRow';

export function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: MixedValue<number>; onChange: (v: number) => void; step?: number }) {
  const isMixed = value === 'mixed';
  const displayValue = isMixed ? '' : Math.round(value * 100) / 100;

  return (
    <PropRow label={label}>
      <input
        type="number"
        value={displayValue}
        placeholder={isMixed ? 'Mixed' : ''}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-md px-2 py-1 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors ${
          isMixed ? 'text-slate-400 italic' : 'text-slate-800 dark:text-slate-200'
        }`}
      />
    </PropRow>
  );
}
