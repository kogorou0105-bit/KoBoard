

export function ToggleBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-slate-100 dark:bg-gray-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}
