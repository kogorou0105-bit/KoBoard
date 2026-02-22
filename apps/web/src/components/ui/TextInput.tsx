
import { PropRow } from '@/components/ui/PropRow';

export function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <PropRow label={label}>
      <input
        type="text"
        value={value}
        placeholder={placeholder || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-md px-2 py-1 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
      />
    </PropRow>
  );
}
