

export function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (!label) {
    return <div>{children}</div>;
  }
  return (
    <div className="flex items-center gap-1">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-6 shrink-0">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
