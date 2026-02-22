
import { useEditorStore } from '@/store/useEditorStore';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { LayerIconBtn } from '@/components/ui/LayerIconBtn';
import { Divider } from '@/components/ui/Divider';

export function LayerControls() {
  const bringToFront = useEditorStore(s => s.bringToFront);
  const sendToBack = useEditorStore(s => s.sendToBack);
  const moveUp = useEditorStore(s => s.moveUp);
  const moveDown = useEditorStore(s => s.moveDown);

  return (
    <>
      <Divider />
      <SectionTitle icon="layers" title="Layer" />
      <div className="flex gap-1">
        <LayerIconBtn icon="flip_to_front" title="Bring to Front" onClick={bringToFront} />
        <LayerIconBtn icon="arrow_upward" title="Move Up" onClick={moveUp} />
        <LayerIconBtn icon="arrow_downward" title="Move Down" onClick={moveDown} />
        <LayerIconBtn icon="flip_to_back" title="Send to Back" onClick={sendToBack} />
      </div>
    </>
  );
}
