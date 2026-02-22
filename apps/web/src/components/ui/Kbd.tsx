

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300 shadow-sm">
      {children}
    </kbd>
  );
}
