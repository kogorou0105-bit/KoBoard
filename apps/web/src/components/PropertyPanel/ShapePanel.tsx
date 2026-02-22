
import { useEditorStore } from '@/store/useEditorStore';
import type { NodeProps } from '@koboard/editor';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { NumberInput } from '@/components/ui/NumberInput';
import { ColorInput } from '@/components/ui/ColorInput';
import { TextInput } from '@/components/ui/TextInput';
import { Divider } from '@/components/ui/Divider';

export function ShapePanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'rect' && info.type !== 'circle') return null;

  const label = info.type === 'rect' ? 'Rectangle' : 'Circle';
  const icon = info.type === 'rect' ? 'rectangle' : 'circle';

  const set = (p: Partial<NodeProps>) => update(p as NodeProps);

  return (
    <>
      <SectionTitle icon={icon} title={label} />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={info.x} onChange={v => set({ x: v })} />
        <NumberInput label="Y" value={info.y} onChange={v => set({ y: v })} />
        <NumberInput label="W" value={info.width} onChange={v => set({ width: Math.max(10, v) })} />
        <NumberInput label="H" value={info.height} onChange={v => set({ height: Math.max(10, v) })} />
      </div>
      <Divider />
      <SectionTitle icon="format_paint" title="Fill" />
      <ColorInput label="" value={info.fill} onChange={v => set({ fill: v })} />
      <Divider />
      <SectionTitle icon="border_color" title="Stroke" />
      <ColorInput label="" value={info.stroke} onChange={v => set({ stroke: v })} />
      {info.type === 'rect' && (
        <div className="mt-2">
          <NumberInput label="Rx" value={info.cornerRadius ?? 0} onChange={v => set({ cornerRadius: Math.max(0, v) })} />
        </div>
      )}
      <Divider />
      <SectionTitle icon="label" title="Label" />
      <TextInput label="" value={info.label} onChange={v => set({ label: v })} placeholder="Double-click to edit" />
      <div className="flex flex-col gap-2 mt-2">
        <NumberInput label="TS" value={info.labelFontSize} onChange={v => set({ labelFontSize: Math.max(6, v) })} />
        <ColorInput label="TC" value={info.labelColor} onChange={v => set({ labelColor: v })} />
      </div>
    </>
  );
}
