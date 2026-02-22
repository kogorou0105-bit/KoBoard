
import { useEditorStore } from '@/store/useEditorStore';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { NumberInput } from '@/components/ui/NumberInput';
import { ColorInput } from '@/components/ui/ColorInput';

export function DefaultFreehandPanel() {
  const config = useEditorStore(s => s.freehandConfig);
  const setConfig = useEditorStore(s => s.setFreehandConfig);

  return (
    <>
      <SectionTitle icon="draw" title="Freehand Tool" />
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 px-1">
        Adjust style for new strokes.
      </p>
      
      <SectionTitle icon="border_color" title="Default Stroke" />
      <ColorInput label="" value={config.stroke} onChange={v => setConfig({ stroke: v })} />
      <div className="mt-2">
        <NumberInput label="Wt" value={config.strokeWidth} onChange={v => setConfig({ strokeWidth: Math.max(1, v) })} />
      </div>
    </>
  );
}
