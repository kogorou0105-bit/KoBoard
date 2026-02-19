import { useEditorStore } from '../store/useEditorStore';
import type { NodeProps } from '@koboard/editor';
import type { MixedValue } from '@koboard/editor'; // Import MixedValue type

// ============ Reusable Input Components ============

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
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

function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: MixedValue<number>; onChange: (v: number) => void; step?: number }) {
  const isMixed = value === 'mixed';
  const displayValue = isMixed ? '' : Math.round(value * 100) / 100;

  return (
    <PropRow label={label}>
      <input
        type="number"
        value={displayValue}
        placeholder={isMixed ? 'Mixed' : ''}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-md px-2 py-1 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors ${
          isMixed ? 'text-slate-400 italic' : 'text-slate-800 dark:text-slate-200'
        }`}
      />
    </PropRow>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: MixedValue<string>; onChange: (v: string) => void }) {
  const isMixed = value === 'mixed';
  const displayValue = isMixed ? '#000000' : value; // Fallback for color picker

  return (
    <PropRow label={label}>
      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7">
           <input
            type="color"
            value={displayValue}
            onChange={e => onChange(e.target.value)}
            className="w-full h-full rounded-md border border-slate-200 dark:border-gray-600 cursor-pointer p-0 opacity-0 absolute inset-0 z-10"
          />
          <div className={`w-full h-full rounded-md border border-slate-200 dark:border-gray-600 flex items-center justify-center ${isMixed ? 'bg-slate-100 dark:bg-slate-700' : ''}`} style={{ backgroundColor: isMixed ? undefined : value }}>
             {isMixed && <span className="text-[10px] text-slate-400 font-bold">?</span>}
          </div>
        </div>
        <input
          type="text"
          value={isMixed ? 'Mixed' : value}
          onChange={e => onChange(e.target.value)}
          className={`flex-1 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-md px-2 py-1 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors ${
            isMixed ? 'text-slate-400 italic' : 'text-slate-800 dark:text-slate-200'
          }`}
        />
      </div>
    </PropRow>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
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

function ToggleBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 mt-4 first:mt-0">
      <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100 dark:border-gray-700/50 my-3" />;
}

// ============ Sub-panels ============

function NoSelectionPanel() {
  const nodeCount = useEditorStore(s => s.nodeCount);
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-gray-600 mb-3">touch_app</span>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">No selection</p>
      <p className="text-xs text-slate-300 dark:text-slate-600">
        {nodeCount > 0 ? `${nodeCount} objects on canvas` : 'Click a tool to add shapes'}
      </p>
    </div>
  );
}

function ShapePanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'rect' && info.type !== 'circle') return null;

  const label = info.type === 'rect' ? 'Rectangle' : 'Circle';
  const icon = info.type === 'rect' ? 'rectangle' : 'circle';

  const set = (p: NodeProps) => update(p);

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
      <Divider />
      <SectionTitle icon="label" title="Label" />
      <TextInput label="" value={info.label} onChange={v => set({ label: v })} placeholder="Double-click to edit" />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <NumberInput label="Sz" value={info.labelFontSize} onChange={v => set({ labelFontSize: Math.max(6, v) })} />
        <ColorInput label="Cl" value={info.labelColor} onChange={v => set({ labelColor: v })} />
      </div>
    </>
  );
}

function TextPanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'text') return null;

  const set = (p: NodeProps) => update(p);

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

function LinePanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  if (info.type !== 'line') return null;

  const set = (p: NodeProps) => update(p);

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
      <div className="grid grid-cols-2 gap-2 mt-2">
        <NumberInput label="Sz" value={info.labelFontSize} onChange={v => set({ labelFontSize: Math.max(6, v) })} />
        <ColorInput label="Cl" value={info.labelColor} onChange={v => set({ labelColor: v })} />
      </div>
    </>
  );
}

// ============ Alignment & Distribution ============

function AlignBtn({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

function AlignmentControls() {
  const store = useEditorStore();
  
  return (
    <div className="mb-4">
       <SectionTitle icon="align_horizontal_left" title="Alignment" />
       <div className="flex justify-between mb-2 px-1">
         <AlignBtn icon="align_horizontal_left" title="Align Left" onClick={store.alignLeft} />
         <AlignBtn icon="align_horizontal_center" title="Align Center" onClick={store.alignCenter} />
         <AlignBtn icon="align_horizontal_right" title="Align Right" onClick={store.alignRight} />
         <div className="w-[1px] h-4 bg-slate-200 dark:bg-gray-700 mx-1 self-center" />
         <AlignBtn icon="align_vertical_top" title="Align Top" onClick={store.alignTop} />
         <AlignBtn icon="align_vertical_center" title="Align Middle" onClick={store.alignMiddle} />
         <AlignBtn icon="align_vertical_bottom" title="Align Bottom" onClick={store.alignBottom} />
       </div>
       <div className="flex justify-evenly px-6">
          <AlignBtn icon="space_dashboard" title="Distribute Horizontal" onClick={store.distributeHorizontal} />
          <AlignBtn icon="grid_view" title="Distribute Vertical" onClick={store.distributeVertical} />
       </div>
       <div className="flex gap-2 mt-3 px-1">
         <button
           onClick={store.groupSelected}
           title="Group Selected (set parent)"
           className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
         >
           <span className="material-symbols-outlined text-[16px]">group_work</span>
           Group
         </button>
         <button
           onClick={store.ungroupSelected}
           title="Ungroup Selected (clear parent)"
           className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 transition-colors"
         >
           <span className="material-symbols-outlined text-[16px]">workspaces</span>
           Ungroup
         </button>
       </div>
       <Divider />
    </div>
  );
}

// ============ Multi-Selection Panel ============

function MultiPanel() {
  const info = useEditorStore(s => s.selectionInfo);
  const update = useEditorStore(s => s.updateSelectedNodes);
  
  if (info.type !== 'multi') return null;

  const set = (p: NodeProps) => update(p);

  return (
    <>
      <AlignmentControls />

      <SectionTitle icon="select_all" title={`Selected (${info.count})`} />
      
      {/* Common Properties: X, Y, W, H */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <NumberInput label="X" value={info.x} onChange={v => set({ x: v })} />
        <NumberInput label="Y" value={info.y} onChange={v => set({ y: v })} />
        <NumberInput label="W" value={info.width} onChange={v => set({ width: Math.max(10, v) })} />
        <NumberInput label="H" value={info.height} onChange={v => set({ height: Math.max(10, v) })} />
      </div>

      {/* Shape Properties (Fill/Stroke) - Only if selection contains shapes */}
      {(info.fill !== undefined || info.stroke !== undefined) && (
        <>
          <Divider />
          {info.fill !== undefined && (
            <>
              <SectionTitle icon="format_paint" title="Fill" />
              <ColorInput label="" value={info.fill} onChange={v => set({ fill: v })} />
            </>
          )}
          {info.stroke !== undefined && (
            <>
             <div className="mt-3">
              <SectionTitle icon="border_color" title="Stroke" />
              <ColorInput label="" value={info.stroke} onChange={v => set({ stroke: v })} />
             </div>
            </>
          )}
        </>
      )}

      {/* Text Properties - Only if selection contains text */}
      {(info.fontSize !== undefined || info.color !== undefined) && (
        <>
          <Divider />
          <SectionTitle icon="text_fields" title="Text" />
          {info.fontSize !== undefined && (
             <NumberInput label="Size" value={info.fontSize} onChange={v => set({ fontSize: Math.max(6, v) })} />
          )}
          {info.color !== undefined && (
             <div className="mt-2">
               <ColorInput label="Color" value={info.color} onChange={v => set({ color: v })} />
             </div>
          )}
        </>
      )}

      {/* Line Properties */}
      {info.lineWidth !== undefined && (
        <>
          <Divider />
          <SectionTitle icon="remove" title="Line" />
          <NumberInput label="Width" value={info.lineWidth} onChange={v => set({ lineWidth: Math.max(1, v) })} />
        </>
      )}
    </>
  );
}

// ============ Layer & Action Controls ============

function LayerIconBtn({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

function LayerControls() {
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

function ActionBar() {
  const deleteSelected = useEditorStore(s => s.deleteSelected);

  return (
    <>
      <Divider />
      <button
        onClick={deleteSelected}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
        Delete
      </button>
    </>
  );
}

// ============ Main PropertyPanel ============

export function PropertyPanel() {
  const selectionInfo = useEditorStore(s => s.selectionInfo);
  const clearAll = useEditorStore(s => s.clearAll);
  const nodeCount = useEditorStore(s => s.nodeCount);
  const hasSelection = selectionInfo.type !== 'none';

  return (
    <aside className="w-[280px] h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-l border-slate-200/80 dark:border-gray-700 shadow-xl shadow-slate-200/20 dark:shadow-black/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-700/50">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Properties</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {selectionInfo.type === 'none' && <NoSelectionPanel />}
        {(selectionInfo.type === 'rect' || selectionInfo.type === 'circle') && <ShapePanel />}
        {selectionInfo.type === 'text' && <TextPanel />}
        {selectionInfo.type === 'line' && <LinePanel />}
        {selectionInfo.type === 'multi' && <MultiPanel />}

        {/* Layer controls (shown for any selection) */}
        {hasSelection && <LayerControls />}
        {hasSelection && <ActionBar />}
      </div>

      {/* Footer: Clear All */}
      {nodeCount > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-gray-700/50">
          <button
            onClick={clearAll}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
            Clear All ({nodeCount})
          </button>
        </div>
      )}
    </aside>
  );
}
