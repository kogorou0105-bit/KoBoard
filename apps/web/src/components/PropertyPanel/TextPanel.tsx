
import { useEditorStore } from '@/store/useEditorStore';
import type { NodeProps } from '@koboard/editor';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { NumberInput } from '@/components/ui/NumberInput';
import { ColorInput } from '@/components/ui/ColorInput';
import { Divider } from '@/components/ui/Divider';

export function TextPanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'text') return null;

  const set = (p: Partial<NodeProps>) => update(p as NodeProps);

  return (
    <>
      <SectionTitle icon="title" title="Text" />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={info.x} onChange={v => set({ x: v })} />
        <NumberInput label="Y" value={info.y} onChange={v => set({ y: v })} />
      </div>
      <Divider />
      <SectionTitle icon="edit" title="Content" />
      <textarea
        value={info.text}
        onChange={e => set({ text: e.target.value })}
        rows={3}
        className="w-full bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-md px-2.5 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
      />
      <Divider />
      <SectionTitle icon="format_size" title="Font" />
      <NumberInput label="Sz" value={info.fontSize} onChange={v => set({ fontSize: Math.max(6, v) })} />
      <div className="mt-2">
        <ColorInput label="Cl" value={info.color} onChange={v => set({ color: v })} />
      </div>
    </>
  );
}
