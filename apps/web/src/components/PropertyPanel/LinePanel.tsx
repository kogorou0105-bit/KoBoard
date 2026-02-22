
import { useEditorStore } from '@/store/useEditorStore';
import type { NodeProps } from '@koboard/editor';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { NumberInput } from '@/components/ui/NumberInput';
import { ColorInput } from '@/components/ui/ColorInput';
import { TextInput } from '@/components/ui/TextInput';
import { ToggleBtn } from '@/components/ui/ToggleBtn';
import { Divider } from '@/components/ui/Divider';

export function LinePanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'line') return null;

  const set = (p: Partial<NodeProps>) => update(p as NodeProps);

  return (
    <>
      <SectionTitle icon="arrow_right_alt" title="Line" />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X1" value={info.x} onChange={v => set({ x: v })} />
        <NumberInput label="Y1" value={info.y} onChange={v => set({ y: v })} />
      </div>
      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 mb-1">End point (read-only)</p>
      <div className="grid grid-cols-2 gap-2 opacity-60">
        <NumberInput label="X2" value={info.endX} onChange={() => {}} />
        <NumberInput label="Y2" value={info.endY} onChange={() => {}} />
      </div>
      <Divider />
      <SectionTitle icon="border_color" title="Stroke" />
      <ColorInput label="" value={info.stroke} onChange={v => set({ stroke: v })} />
      <div className="mt-2">
        <NumberInput label="Wt" value={info.lineWidth} onChange={v => set({ lineWidth: Math.max(1, v) })} />
      </div>
      <Divider />
      <SectionTitle icon="arrow_forward" title="Arrows" />
      <div className="flex gap-2">
        <ToggleBtn label="← Start" active={info.startArrow} onClick={() => set({ startArrow: !info.startArrow })} />
        <ToggleBtn label="End →" active={info.endArrow} onClick={() => set({ endArrow: !info.endArrow })} />
      </div>
      <Divider />
      <SectionTitle icon="label" title="Label" />
      <TextInput label="" value={info.label} onChange={v => set({ label: v })} placeholder="e.g. gRPC, TCP:3306" />
      <div className="flex flex-col gap-2 mt-2">
        <NumberInput label="Text Size" value={info.labelFontSize} onChange={v => set({ labelFontSize: Math.max(6, v) })} />
        <ColorInput label="Text Color" value={info.labelColor} onChange={v => set({ labelColor: v })} />
      </div>
    </>
  );
}
