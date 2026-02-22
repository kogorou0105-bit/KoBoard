
import { useEditorStore } from '@/store/useEditorStore';
import type { NodeProps } from '@koboard/editor';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { NumberInput } from '@/components/ui/NumberInput';
import { ColorInput } from '@/components/ui/ColorInput';
import { Divider } from '@/components/ui/Divider';

export function FreehandPanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'freehand') return null;

  const set = (p: Partial<NodeProps>) => update(p as NodeProps);

  return (
    <>
      <SectionTitle icon="draw" title="Freehand" />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={info.x} onChange={v => set({ x: v })} />
        <NumberInput label="Y" value={info.y} onChange={v => set({ y: v })} />
        <NumberInput label="W" value={info.width} onChange={v => set({ width: Math.max(10, v) })} />
        <NumberInput label="H" value={info.height} onChange={v => set({ height: Math.max(10, v) })} />
      </div>
      <Divider />
      <SectionTitle icon="border_color" title="Stroke" />
      <ColorInput label="" value={info.stroke} onChange={v => set({ stroke: v })} />
      <div className="mt-2">
        <NumberInput label="Wt" value={info.strokeWidth} onChange={v => set({ strokeWidth: Math.max(1, v) })} />
      </div>
    </>
  );
}
