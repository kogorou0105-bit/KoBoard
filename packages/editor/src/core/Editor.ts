import { Viewport } from './Viewport';
import { Scene } from '../scene/Scene';
import type { SceneData } from '../scene/Scene';
import { RectNode, TextNode, CircleNode, LineNode, FreehandNode } from '../scene/SceneNode';
import type { SelectionInfo, NodeProps, MultiSelectionInfo } from './types';
import type { LineBinding } from '../scene/SceneNode';

export class Editor {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  scene: Scene;
  width: number = 0;
  height: number = 0;
  
  // Callbacks
  private listeners: (() => void)[] = [];
  private static STORAGE_KEY = 'koboard_scene';

  // History (Undo/Redo)
  private history: SceneData[] = [];
  private historyIndex: number = -1;
  private static MAX_HISTORY = 50;
  private isUndoRedoing: boolean = false;
  private isEditingText: boolean = false;
  private boxStart: { x: number; y: number } | null = null;
  private boxCurrent: { x: number; y: number } | null = null;

  // Clipboard for copy/paste
  private clipboard: SceneData | null = null;
  private pasteOffset: number = 0;

  // Transform Handles
  private static HANDLE_SIZE = 8;
  private static SNAP_DISTANCE = 12; // world-space snap threshold

  // Active tool
  private _tool: 'select' | 'freehand' = 'select';
  
  get tool() { return this._tool; }
  setTool(tool: 'select' | 'freehand') {
    this._tool = tool;
    this.canvas.style.cursor = tool === 'freehand' ? 'crosshair' : 'default';
  }

  // Default styles for new freehand nodes
  freehandConfig = { stroke: '#000000', strokeWidth: 2 };

  setFreehandConfig(config: { stroke?: string; strokeWidth?: number }) {
    if (config.stroke !== undefined) this.freehandConfig.stroke = config.stroke;
    if (config.strokeWidth !== undefined) this.freehandConfig.strokeWidth = config.strokeWidth;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.viewport = new Viewport();
    this.scene = new Scene();
    
    // Restore from localStorage (if available)
    this.restoreFromStorage();

    this.resize();
    window.addEventListener('resize', this.resize);
    
    // Binding events
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('dblclick', this.onDblClick);
    
    // Push initial snapshot
    this.pushSnapshot();

    window.addEventListener('keydown', this.onKeyDown);

    this.render();
  }

  dispose() {
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('dblclick', this.onDblClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  resize = () => {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;
    // Handle DPI
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.render();
  };

  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom
      const zoomFactor = 1 - e.deltaY * 0.001;
      this.viewport.zoomAt(e.offsetX, e.offsetY, zoomFactor);
    } else {
      // Pan
      this.viewport.pan(-e.deltaX, -e.deltaY);
    }
    this.render();
    this.saveToStorage();
  };

  onMouseDown = (e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0)) { // Middle or Left click
       const startX = e.clientX;
       const startY = e.clientY;
       
       // Handle Pan
       // Check for space key using KeyboardEvent state if possible, but MouseEvent doesn't have it.
       // Usually we track keys globally or use e.shiftKey etc.
       // For now, let's look at ctrl/meta/shift/alt.
       // The previous attempt used e.spaceKey which doesn't exist.
       // We can assume Space usage requires global key tracking or we just stick to wheel/middle-click.
       // Let's remove spaceKey check for now and rely on Middle Click (button 1) or Ctrl+Drag?
       // Standard is Space+Drag, which requires `keydown` tracking.
       // Let's stick to Middle Click or Shift+Click for now.
       const isPan = e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey || e.shiftKey));

       // Freehand drawing mode
       if (!isPan && this._tool === 'freehand' && e.button === 0) {
         const { x: wx, y: wy } = this.viewport.screenToWorld(e.offsetX, e.offsetY);
         const node = new FreehandNode(crypto.randomUUID());
         
         // Apply default config
         node.stroke = this.freehandConfig.stroke;
         node.strokeWidth = this.freehandConfig.strokeWidth;

         const currentPoints = [{ x: wx, y: wy }];
         node.setPoints(currentPoints);
         
         this.scene.addNode(node);

         const onMove = (ev: MouseEvent) => {
           const { x: mx, y: my } = this.viewport.screenToWorld(ev.offsetX, ev.offsetY);
           currentPoints.push({ x: mx, y: my });
           node.setPoints(currentPoints);
           this.render();
         };

         const onUp = () => {
           window.removeEventListener('mousemove', onMove);
           window.removeEventListener('mouseup', onUp);
           
           if (node.points.length < 2) {
             // Too short, remove
             this.scene.removeNode(node.id);
           } else {
             // Finalize (setPoints calls updateBounds internally logic)
             node.setPoints(currentPoints);
             this.pushSnapshot();
           }
           this.render();
           this.emitChange();
         };


         window.addEventListener('mousemove', onMove);
         window.addEventListener('mouseup', onUp);
         return;
       }
       
       if (isPan) {
         let lastX = startX;
         let lastY = startY;

         const onMove = (ev: MouseEvent) => {
            const dx = ev.clientX - lastX;
            const dy = ev.clientY - lastY;
            this.viewport.pan(dx, dy);
            this.render();
            lastX = ev.clientX;
            lastY = ev.clientY;
         };

         const onUp = () => {
           window.removeEventListener('mousemove', onMove);
           window.removeEventListener('mouseup', onUp);
            this.saveToStorage();
         };

         window.addEventListener('mousemove', onMove);
         window.addEventListener('mouseup', onUp);
       } else {
         // Handle Selection & Drag
         const { x: worldX, y: worldY } = this.viewport.screenToWorld(e.offsetX, e.offsetY);

         // 0. Check Line Endpoint Hit
         const endpointHit = this.getLineEndpointAtPoint(worldX, worldY);
         if (endpointHit) {
           // Make sure the line is selected
           if (!endpointHit.node.isSelected) {
             this.scene.nodes.forEach(n => n.isSelected = false);
             endpointHit.node.isSelected = true;
             this.render();
             this.emitChange();
           }
           this.startEndpointDrag(e, endpointHit);
           return;
         }

         // 1. Check Handle Hit (Resize)
         const handleHit = this.getHandleAtPoint(worldX, worldY);
         if (handleHit) {
           this.startResize(e, handleHit);
           return;
         }

         // 2. Check Node Hit (Select/Drag)
         const hit = this.scene.hitTest(worldX, worldY);
         
         if (hit) {
            // Select logic
            if (!e.shiftKey) {
                // Determine if we are clicking on an already selected item?
                // If yes, keep selection (might be starting a group drag).
                // If no, clear others and select this.
                if (!hit.isSelected) {
                   this.scene.nodes.forEach(n => n.isSelected = false);
                   hit.isSelected = true;
                }
            } else {
               hit.isSelected = !hit.isSelected;
            }
            this.render();
            this.emitChange();

            // Drag Logic
            // If the item is selected (it should be now or was), start dragging
             if (hit.isSelected) {
                const startX = worldX;
                const startY = worldY;
                
                // Snapshot original positions of all selected nodes + their descendants
                 const selectedNodes = this.scene.nodes.filter(n => n.isSelected);
                 const selectedIds = new Set(selectedNodes.map(n => n.id));
                 
                 // Collect descendants that are not already selected
                 const extraNodes: SceneNode[] = [];
                 for (const sel of selectedNodes) {
                   const desc = this.getDescendants(sel.id);
                   for (const d of desc) {
                     if (!selectedIds.has(d.id)) {
                       extraNodes.push(d);
                       selectedIds.add(d.id); // prevent duplicates
                     }
                   }
                 }
                 
                 const allDragNodes = [...selectedNodes, ...extraNodes];
                 const initialPositions = allDragNodes
                    .map(n => ({ node: n, startX: n.x, startY: n.y }));
                
                const onDragMove = (ev: MouseEvent) => {
                    const { x: currX, y: currY } = this.viewport.screenToWorld(ev.offsetX, ev.offsetY);
                    const dx = currX - startX;
                    const dy = currY - startY;

                    initialPositions.forEach(({ node, startX: nx, startY: ny }) => {
                        node.x = nx + dx;
                        node.y = ny + dy;
                    });

                    // Follow logic: update any lines bound to moved nodes
                    this.updateLineBindings();

                    this.render();
                };

                const onDragUp = () => {
                   window.removeEventListener('mousemove', onDragMove);
                   window.removeEventListener('mouseup', onDragUp);
                   this.emitChange(); // Final position update
                };
                
                 window.addEventListener('mousemove', onDragMove);
                 window.addEventListener('mouseup', onDragUp);
             }

         } else {
            // Click on empty space: Start Box Selection (if not Panning)
            // We already checked for Pan (Shift+Click) at the top.
            // So here it's just Left Drag without Shift.
            this.startBoxSelection(e, worldX, worldY);
         }
       }
    }
  };

  private startBoxSelection(e: MouseEvent, startX: number, startY: number) {
    this.boxStart = { x: startX, y: startY };
    this.boxCurrent = { x: startX, y: startY };
    
    // Clear selection if not adding (Ctrl/Meta)
    if (!e.ctrlKey && !e.metaKey) {
        this.scene.nodes.forEach(n => n.isSelected = false);
    }
    this.render(); // Redraw to clear handles or show empty box

    const onMove = (ev: MouseEvent) => {
        const { x, y } = this.viewport.screenToWorld(ev.offsetX, ev.offsetY);
        this.boxCurrent = { x, y };
        this.render();
    };

    const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        
        // Finalize selection
        if (this.boxStart && this.boxCurrent) {
            const minX = Math.min(this.boxStart.x, this.boxCurrent.x);
            const minY = Math.min(this.boxStart.y, this.boxCurrent.y);
            const maxX = Math.max(this.boxStart.x, this.boxCurrent.x);
            const maxY = Math.max(this.boxStart.y, this.boxCurrent.y);

            // Avoid selecting on tiny clicks
            if (maxX - minX > 2 || maxY - minY > 2) {
                const isAdditive = e.ctrlKey || e.metaKey;
                
                this.scene.nodes.forEach(node => {
                    if (this.intersectBox(node, minX, minY, maxX, maxY)) {
                        node.isSelected = true; // Always select if inside
                    } else if (!isAdditive) {
                        // If not additive, deselect nodes outside box
                        // (Already cleared at start, but double check logic if we want partial retention?)
                        // We strictly cleared at start if not additive.
                        // So here we only need to select those inside.
                    }
                });
            }
        }
        
        this.boxStart = null;
        this.boxCurrent = null;
        this.render();
        this.emitChange();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  private intersectBox(node: any, minX: number, minY: number, maxX: number, maxY: number): boolean {
    const nMinX = node.x;
    const nMinY = node.y;
    // Handle width/height (text/rect/circle)
    // For LineNode, width/height are deltas, need normalization
    let nMaxX = node.x + node.width;
    let nMaxY = node.y + node.height;
    
    if (node instanceof LineNode) {
        nMaxX = Math.max(node.x, node.endX);
        nMaxY = Math.max(node.y, node.endY);
        const lMinX = Math.min(node.x, node.endX);
        const lMinY = Math.min(node.y, node.endY);
        // Strict containment: Node L/R/T/B must be within Box L/R/T/B
        return lMinX >= minX && nMaxX <= maxX && lMinY >= minY && nMaxY <= maxY;
    }

    return nMinX >= minX && nMaxX <= maxX && nMinY >= minY && nMaxY <= maxY;
  }

  addRect() {
    const rect = new RectNode('rect-' + Date.now());
    rect.x = -this.viewport.x + 100; // rough placement
    rect.y = -this.viewport.y + 100;
    this.scene.addNode(rect);
    this.render();
    this.emitChange();
  }

  addText() {
    const text = new TextNode('text-' + Date.now());
    text.x = -this.viewport.x + 150;
    text.y = -this.viewport.y + 150;
    this.scene.addNode(text);
    this.render();
    this.emitChange();
  }

  addCircle() {
    const circle = new CircleNode('circle-' + Date.now());
    circle.x = -this.viewport.x + 120;
    circle.y = -this.viewport.y + 120;
    this.scene.addNode(circle);
    this.render();
    this.emitChange();
  }

  addLine() {
    const line = new LineNode('line-' + Date.now());
    line.x = -this.viewport.x + 100;
    line.y = -this.viewport.y + 200;
    line.width = 150;
    line.height = 0;
    this.scene.addNode(line);
    this.render();
    this.emitChange();
  }

  // ============ Layer Management ============

  bringToFront() {
    const nodes = this.scene.nodes;
    const selected = nodes.filter(n => n.isSelected);
    if (selected.length === 0) return;
    this.scene.nodes = [...nodes.filter(n => !n.isSelected), ...selected];
    this.render();
    this.emitChange();
  }

  sendToBack() {
    const nodes = this.scene.nodes;
    const selected = nodes.filter(n => n.isSelected);
    if (selected.length === 0) return;
    this.scene.nodes = [...selected, ...nodes.filter(n => !n.isSelected)];
    this.render();
    this.emitChange();
  }

  moveUp() {
    const nodes = this.scene.nodes;
    for (let i = nodes.length - 2; i >= 0; i--) {
      if (nodes[i].isSelected && !nodes[i + 1].isSelected) {
        [nodes[i], nodes[i + 1]] = [nodes[i + 1], nodes[i]];
      }
    }
    this.render();
    this.emitChange();
  }

  moveDown() {
    const nodes = this.scene.nodes;
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].isSelected && !nodes[i - 1].isSelected) {
        [nodes[i], nodes[i - 1]] = [nodes[i - 1], nodes[i]];
      }
    }
    this.render();
    this.emitChange();
  }

  // ============ Alignment & Distribution ============

  alignLeft() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;
    const minX = Math.min(...selected.map(n => n.x));
    selected.forEach(n => n.x = minX);
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  alignCenter() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;
    // Center logic: find selection bounds center
    const minX = Math.min(...selected.map(n => n.x));
    const maxX = Math.max(...selected.map(n => n.x + n.width));
    const centerX = (minX + maxX) / 2;
    selected.forEach(n => n.x = centerX - n.width / 2);
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  alignRight() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;
    const maxX = Math.max(...selected.map(n => n.x + n.width));
    selected.forEach(n => n.x = maxX - n.width);
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  alignTop() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;
    const minY = Math.min(...selected.map(n => n.y));
    selected.forEach(n => n.y = minY);
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  alignMiddle() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;
    const minY = Math.min(...selected.map(n => n.y));
    const maxY = Math.max(...selected.map(n => n.y + n.height));
    const centerY = (minY + maxY) / 2;
    selected.forEach(n => n.y = centerY - n.height / 2);
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  alignBottom() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;
    const maxY = Math.max(...selected.map(n => n.y + n.height));
    selected.forEach(n => n.y = maxY - n.height);
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  distributeHorizontal() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 3) return;
    // Sort by x
    selected.sort((a, b) => a.x - b.x);
    const minX = selected[0].x;
    const maxX = selected[selected.length - 1].x + selected[selected.length - 1].width;
    const totalW = selected.reduce((sum, n) => sum + n.width, 0);
    const gap = (maxX - minX - totalW) / (selected.length - 1);
    
    let currentX = minX;
    selected.forEach(n => {
      n.x = currentX;
      currentX += n.width + gap;
    });
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  distributeVertical() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 3) return;
    // Sort by y
    selected.sort((a, b) => a.y - b.y);
    const minY = selected[0].y;
    const maxY = selected[selected.length - 1].y + selected[selected.length - 1].height;
    const totalH = selected.reduce((sum, n) => sum + n.height, 0);
    const gap = (maxY - minY - totalH) / (selected.length - 1);
    
    let currentY = minY;
    selected.forEach(n => {
      n.y = currentY;
      currentY += n.height + gap;
    });
    this.updateLineBindings();
    this.render();
    this.emitChange();
  }

  // ============ Clear All ============

  clearAll() {
    if (this.scene.nodes.length === 0) return;
    this.scene.nodes = [];
    this.render();
    this.emitChange();
  }

  // ============ Grouping ============

  /** Get direct children of a node */
  getChildren(nodeId: string): SceneNode[] {
    return this.scene.nodes.filter(n => n.parentId === nodeId);
  }

  /** Recursively get all descendants of a node */
  getDescendants(nodeId: string): SceneNode[] {
    const result: SceneNode[] = [];
    const stack = [nodeId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      const children = this.scene.nodes.filter(n => n.parentId === current);
      for (const child of children) {
        result.push(child);
        stack.push(child.id);
      }
    }
    return result;
  }

  /** Group selected nodes: the largest area node becomes parent */
  groupSelected() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length < 2) return;

    // Pick the one with largest bounding area as parent
    let parent = selected[0];
    let maxArea = parent.width * parent.height;
    for (const n of selected) {
      const area = n.width * n.height;
      if (area > maxArea) {
        maxArea = area;
        parent = n;
      }
    }

    // Set parentId on all other selected nodes
    for (const n of selected) {
      if (n !== parent) {
        n.parentId = parent.id;
      }
    }

    this.render();
    this.emitChange();
  }

  /** Ungroup: clear parentId of selected nodes */
  ungroupSelected() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    for (const n of selected) {
      // Also unparent any children of selected nodes
      const children = this.getChildren(n.id);
      for (const child of children) {
        child.parentId = null;
      }
      n.parentId = null;
    }
    this.render();
    this.emitChange();
  }

  /** Draw dashed borders around nodes that have children */
  private renderGroupIndicators() {
    // Find all nodes that are parents
    const parentIds = new Set<string>();
    for (const n of this.scene.nodes) {
      if (n.parentId) parentIds.add(n.parentId);
    }

    for (const pid of parentIds) {
      const parent = this.scene.nodes.find(n => n.id === pid);
      if (!parent) continue;

      const children = this.getDescendants(pid);
      const allNodes = [parent, ...children];

      // Compute bounding box of all nodes in the group
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of allNodes) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.width);
        maxY = Math.max(maxY, n.y + n.height);
      }

      const pad = 8;
      this.ctx.save();
      this.ctx.setLineDash([6 / this.viewport.scale, 4 / this.viewport.scale]);
      this.ctx.strokeStyle = '#999';
      this.ctx.lineWidth = 1 / this.viewport.scale;
      this.ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
      this.ctx.setLineDash([]);
      this.ctx.restore();
    }
  }

  private renderSelectionBox() {
    if (!this.boxStart || !this.boxCurrent) return;
    
    const x = Math.min(this.boxStart.x, this.boxCurrent.x);
    const y = Math.min(this.boxStart.y, this.boxCurrent.y);
    const w = Math.abs(this.boxCurrent.x - this.boxStart.x);
    const h = Math.abs(this.boxCurrent.y - this.boxStart.y);

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 102, 204, 0.1)';
    this.ctx.strokeStyle = '#0066cc';
    this.ctx.lineWidth = 1 / this.viewport.scale;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.restore();
  }

  render = () => {
    // Clear
    this.ctx.clearRect(0, 0, this.width, this.height); // Using logical width
    // Actually when using transforms, ctx.clearRect might need to be transformed or reset transform
    // But here we haven't applied viewport transform yet.
    // Wait! this.ctx.scale(dpr, dpr) is applied in resize().
    // So 0,0,width,height covers logical area. Correct.
    
    this.ctx.save();
    // Apply Viewport Transform
    const t = this.viewport.transform;
    this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);


    // Compute visible world bounds for viewport culling
    const viewBounds = this.getViewBounds();

    // Draw Scene (only visible nodes)
    this.scene.render(this.ctx, viewBounds);

    // Draw Transform Handles
    this.renderGroupIndicators();
    this.renderHandles();
    this.renderSelectionBox();
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2 / this.viewport.scale; // 保持线宽永远是视觉上的 2px
    this.ctx.moveTo(-50, 0); this.ctx.lineTo(50, 0); // X轴
    this.ctx.moveTo(0, -50); this.ctx.lineTo(0, 50); // Y轴
    this.ctx.stroke();
    this.ctx.fillText("世界原点 (0,0)", 5, -5);
    this.ctx.restore();
  };

  /** Compute the visible world-space bounding rect for viewport culling */
  private getViewBounds() {
    const topLeft = this.viewport.screenToWorld(0, 0);
    const bottomRight = this.viewport.screenToWorld(this.width, this.height);
    // Add a generous pad so nodes partially onscreen still render
    const pad = 100 / this.viewport.scale;
    return {
      minX: topLeft.x - pad,
      minY: topLeft.y - pad,
      maxX: bottomRight.x + pad,
      maxY: bottomRight.y + pad,
    };
  }

  drawGrid() {
    // Grid removed — clean canvas
  }

  // Event System
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitChange() {
    if (!this.isUndoRedoing) {
      this.pushSnapshot();
    }
    this.listeners.forEach(l => l());
    this.saveToStorage();
  }

  // ============ Undo / Redo ============

  private pushSnapshot() {
    const snapshot = this.scene.toJSON();
    // Truncate any redo history
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    // Cap history length
    if (this.history.length > Editor.MAX_HISTORY) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    this.isUndoRedoing = true;
    this.historyIndex--;
    this.scene.loadFromJSON(this.history[this.historyIndex]);
    this.render();
    this.listeners.forEach(l => l());
    this.saveToStorage();
    this.isUndoRedoing = false;
  }

  redo() {
    if (!this.canRedo()) return;
    this.isUndoRedoing = true;
    this.historyIndex++;
    this.scene.loadFromJSON(this.history[this.historyIndex]);
    this.render();
    this.listeners.forEach(l => l());
    this.saveToStorage();
    this.isUndoRedoing = false;
  }

  // ============ Persistence (LocalStorage) ============

  private saveToStorage() {
    try {
      const data = {
        scene: this.scene.toJSON(),
        viewport: { transform: [...this.viewport.transform] },
      };
      localStorage.setItem(Editor.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  private restoreFromStorage() {
    try {
      const json = localStorage.getItem(Editor.STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json);
        // Restore scene
        if (data.scene) {
          this.scene.loadFromJSON(data.scene);
        }
        // Restore viewport
        if (data.viewport?.transform) {
          this.viewport.transform = data.viewport.transform;
        }
        console.log('✅ Scene & viewport restored from localStorage');
      }
    } catch (e) {
      console.warn('Failed to restore from localStorage:', e);
    }
  }

  // ============ Selection Info & Property Updates ============

  getSelectionInfo(): SelectionInfo {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length === 0) return { type: 'none' };

    if (selected.length === 1) {
      const node = selected[0];
      if (node instanceof RectNode) {
        return { type: 'rect', id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, fill: node.fill, stroke: node.stroke, label: node.label, labelFontSize: node.labelFontSize, labelColor: node.labelColor };
      }
      if (node instanceof CircleNode) {
        return { type: 'circle', id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, fill: node.fill, stroke: node.stroke, label: node.label, labelFontSize: node.labelFontSize, labelColor: node.labelColor };
      }
      if (node instanceof TextNode) {
        return { type: 'text', id: node.id, x: node.x, y: node.y, text: node.text, fontSize: node.fontSize, color: node.color };
      }
      if (node instanceof LineNode) {
        return { type: 'line', id: node.id, x: node.x, y: node.y, endX: node.endX, endY: node.endY, stroke: node.stroke, lineWidth: node.lineWidth, startArrow: node.startArrow, endArrow: node.endArrow, label: node.label, labelFontSize: node.labelFontSize, labelColor: node.labelColor };
      }
      if (node instanceof FreehandNode) {
        return { type: 'freehand', id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, stroke: node.stroke, strokeWidth: node.strokeWidth };
      }
      return { type: 'none' };
    }

    // --- Multi-selection: build mixed-state info ---
    const mixedVal = <T>(values: T[]): T | 'mixed' => {
      return values.every(v => v === values[0]) ? values[0] : 'mixed';
    };

    const nodeTypes = new Set<'rect' | 'circle' | 'text' | 'line' | 'freehand'>();
    for (const node of selected) {
      if (node instanceof RectNode) nodeTypes.add('rect');
      else if (node instanceof CircleNode) nodeTypes.add('circle');
      else if (node instanceof TextNode) nodeTypes.add('text');
      else if (node instanceof LineNode) nodeTypes.add('line');
      else if (node instanceof FreehandNode) nodeTypes.add('freehand');
    }

    const info: MultiSelectionInfo = {
      type: 'multi',
      count: selected.length,
      ids: selected.map(n => n.id),
      nodeTypes: [...nodeTypes],
      x: mixedVal(selected.map(n => n.x)),
      y: mixedVal(selected.map(n => n.y)),
      width: mixedVal(selected.map(n => n.width)),
      height: mixedVal(selected.map(n => n.height)),
    };

    // Shape properties (rect + circle)
    const shapes = selected.filter(n => n instanceof RectNode || n instanceof CircleNode) as (RectNode | CircleNode)[];
    if (shapes.length === selected.length) {
      // All are shapes
      info.fill = mixedVal(shapes.map(s => s.fill));
      info.stroke = mixedVal(shapes.map(s => s.stroke));
    } else if (shapes.length > 0) {
      // Some shapes in mixed selection
      info.fill = 'mixed';
      info.stroke = 'mixed';
    }

    // Text properties
    const texts = selected.filter(n => n instanceof TextNode) as TextNode[];
    if (texts.length === selected.length) {
      info.fontSize = mixedVal(texts.map(t => t.fontSize));
      info.color = mixedVal(texts.map(t => t.color));
    } else if (texts.length > 0) {
      info.color = 'mixed';
    }

    // Line properties
    const lines = selected.filter(n => n instanceof LineNode) as LineNode[];
    if (lines.length === selected.length) {
      info.lineWidth = mixedVal(lines.map(l => l.lineWidth));
      info.stroke = mixedVal(lines.map(l => l.stroke));
    }

    return info;
  }

  updateSelectedNodes(props: NodeProps) {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    for (const node of selected) {
      if (props.x !== undefined) node.x = props.x;
      if (props.y !== undefined) node.y = props.y;
      if (props.width !== undefined) node.width = props.width;
      if (props.height !== undefined) node.height = props.height;

      if (node instanceof RectNode || node instanceof CircleNode) {
        if (props.fill !== undefined) node.fill = props.fill;
        if (props.stroke !== undefined) node.stroke = props.stroke;
        if (props.label !== undefined) node.label = props.label;
        if (props.labelFontSize !== undefined) node.labelFontSize = props.labelFontSize;
        if (props.labelColor !== undefined) node.labelColor = props.labelColor;
      }
      if (node instanceof TextNode) {
        if (props.text !== undefined) node.text = props.text;
        if (props.fontSize !== undefined) node.fontSize = props.fontSize;
        if (props.color !== undefined) node.color = props.color;
      }
      if (node instanceof LineNode) {
        if (props.stroke !== undefined) node.stroke = props.stroke;
        if (props.lineWidth !== undefined) node.lineWidth = props.lineWidth;
        if (props.startArrow !== undefined) node.startArrow = props.startArrow;
        if (props.endArrow !== undefined) node.endArrow = props.endArrow;
        if (props.label !== undefined) node.label = props.label;
        if (props.labelFontSize !== undefined) node.labelFontSize = props.labelFontSize;
        if (props.labelColor !== undefined) node.labelColor = props.labelColor;
      }
      if (node instanceof FreehandNode) {
        if (props.stroke !== undefined) node.stroke = props.stroke;
        if (props.strokeWidth !== undefined) node.strokeWidth = props.strokeWidth;
      }
    }
    this.render();
    this.emitChange();
  }

  // ============ Serialization ============

  saveJSON(): string {
    return JSON.stringify(this.scene.toJSON(), null, 2);
  }

  loadJSON(json: string) {
    const data: SceneData = JSON.parse(json);
    this.scene.loadFromJSON(data);
    this.render();
    this.emitChange();
  }

  // ============ Copy / Paste ============

  copySelected() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length === 0) return;

    this.clipboard = {
      nodes: selected.map(n => n.toJSON()),
    };
    this.pasteOffset = 0; // reset offset on new copy
  }

  pasteClipboard() {
    if (!this.clipboard || this.clipboard.nodes.length === 0) return;

    this.pasteOffset += 20; // stagger each paste

    // Build old-ID -> new-ID map
    const idMap = new Map<string, string>();
    for (const nd of this.clipboard.nodes) {
      idMap.set(nd.id, crypto.randomUUID());
    }

    // Deep clone + remap
    const cloned = JSON.parse(JSON.stringify(this.clipboard.nodes)) as typeof this.clipboard.nodes;
    for (const nd of cloned) {
      const newId = idMap.get(nd.id)!;
      nd.id = newId;

      // Offset position
      nd.x += this.pasteOffset;
      nd.y += this.pasteOffset;

      // Remap parentId
      if (nd.parentId) {
        nd.parentId = idMap.get(nd.parentId) ?? undefined;
      }

      // Remap line bindings
      if (nd.type === 'line') {
        const lineData = nd as any;
        if (lineData.startBinding?.nodeId) {
          const mapped = idMap.get(lineData.startBinding.nodeId);
          if (mapped) {
            lineData.startBinding.nodeId = mapped;
          } else {
            lineData.startBinding = null; // bound node not in clipboard
          }
        }
        if (lineData.endBinding?.nodeId) {
          const mapped = idMap.get(lineData.endBinding.nodeId);
          if (mapped) {
            lineData.endBinding.nodeId = mapped;
          } else {
            lineData.endBinding = null;
          }
        }
      }
    }

    // Deselect current, then add & select pasted nodes
    this.scene.nodes.forEach(n => n.isSelected = false);

    const tempScene: SceneData = { nodes: cloned };
    const before = this.scene.nodes.length;
    this.scene.loadFromJSON({ nodes: [...this.scene.toJSON().nodes, ...tempScene.nodes] });

    // Select only the newly added nodes
    for (let i = before; i < this.scene.nodes.length; i++) {
      this.scene.nodes[i].isSelected = true;
    }

    this.updateLineBindings();
    this.pushSnapshot();
    this.render();
    this.emitChange();
  }


  duplicateSelected() {
    this.copySelected();
    this.pasteClipboard();
  }

  exportPNG() {
    // Render all nodes (no culling) without selection visuals
    const selected = this.scene.nodes.filter(n => n.isSelected);
    selected.forEach(n => n.isSelected = false);

    // Temporarily render without culling for full export
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    const t = this.viewport.transform;
    this.ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
    this.scene.render(this.ctx); // no viewBounds = render all
    this.ctx.restore();

    const dataUrl = this.canvas.toDataURL('image/png');

    // Restore selection & re-render normally
    selected.forEach(n => n.isSelected = true);
    this.render();

    // Download
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `koboard-${Date.now()}.png`;
    a.click();
  }

  exportSVG() {
    const nodes = this.scene.nodes;
    let svgContent = '';

    // Compute bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }

    const pad = 20;
    const vw = maxX - minX + pad * 2;
    const vh = maxY - minY + pad * 2;
    const ox = minX - pad;
    const oy = minY - pad;

    for (const n of nodes) {
      if (n instanceof RectNode) {
        svgContent += `  <rect x="${n.x - ox}" y="${n.y - oy}" width="${n.width}" height="${n.height}" fill="${n.fill}" stroke="${n.stroke}" stroke-width="1" />\n`;
        if (n.label) {
          const lines = n.label.split('\n');
          const lh = n.labelFontSize * 1.3;
          const cy = n.y - oy + n.height / 2 - (lines.length - 1) * lh / 2;
          lines.forEach((line, i) => {
            svgContent += `  <text x="${n.x - ox + n.width / 2}" y="${cy + i * lh}" text-anchor="middle" dominant-baseline="central" font-size="${n.labelFontSize}" fill="${n.labelColor}" font-family="sans-serif">${this.escSvg(line)}</text>\n`;
          });
        }
      } else if (n instanceof CircleNode) {
        const cx = n.x - ox + n.width / 2;
        const cy = n.y - oy + n.height / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${n.width / 2}" ry="${n.height / 2}" fill="${n.fill}" stroke="${n.stroke}" stroke-width="1" />\n`;
        if (n.label) {
          const lines = n.label.split('\n');
          const lh = n.labelFontSize * 1.3;
          const ty = cy - (lines.length - 1) * lh / 2;
          lines.forEach((line, i) => {
            svgContent += `  <text x="${cx}" y="${ty + i * lh}" text-anchor="middle" dominant-baseline="central" font-size="${n.labelFontSize}" fill="${n.labelColor}" font-family="sans-serif">${this.escSvg(line)}</text>\n`;
          });
        }
      } else if (n instanceof TextNode) {
        const lines = n.text.split('\n');
        const lh = n.fontSize * 1.3;
        lines.forEach((line, i) => {
          svgContent += `  <text x="${n.x - ox}" y="${n.y - oy + i * lh}" dominant-baseline="hanging" font-size="${n.fontSize}" fill="${n.color}" font-family="sans-serif">${this.escSvg(line)}</text>\n`;
        });
      } else if (n instanceof LineNode) {
        svgContent += `  <line x1="${n.x - ox}" y1="${n.y - oy}" x2="${n.endX - ox}" y2="${n.endY - oy}" stroke="${n.stroke}" stroke-width="${n.lineWidth}" />\n`;
        // Arrows as markers would be complex; skip for SVG export
        if (n.label) {
          const mx = (n.x + n.endX) / 2 - ox;
          const my = (n.y + n.endY) / 2 - oy;
          const lines = n.label.split('\n');
          const lh = n.labelFontSize * 1.3;
          const ty = my - (lines.length - 1) * lh / 2;
          lines.forEach((line, i) => {
            svgContent += `  <text x="${mx}" y="${ty + i * lh}" text-anchor="middle" dominant-baseline="central" font-size="${n.labelFontSize}" fill="${n.labelColor}" font-family="sans-serif">${this.escSvg(line)}</text>\n`;
          });
        }
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}">\n  <rect width="100%" height="100%" fill="white" />\n${svgContent}</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koboard-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escSvg(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ============ Selection Bounds (for floating toolbar) ============

  getSelectionScreenBounds(): { x: number; y: number; width: number; height: number } | null {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of selected) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }

    const t = this.viewport.transform;
    const sx = minX * t[0] + t[4];
    const sy = minY * t[3] + t[5];
    const sw = (maxX - minX) * t[0];
    const sh = (maxY - minY) * t[3];

    return { x: sx, y: sy, width: sw, height: sh };
  }
  
  // Override render to emit change? 
  // Probably too frequent. Better to emit on specific actions (add, select, dragEnd).
  // For now, let's call emitChange manually in actions.

  // ============ Transform Handles & Resize ============

  onMouseMove = (e: MouseEvent) => {
    // Only update cursor when not dragging (no buttons pressed)
    if (e.buttons !== 0) return;

    const { x: worldX, y: worldY } = this.viewport.screenToWorld(e.offsetX, e.offsetY);

    // Check line endpoint hover
    const epHit = this.getLineEndpointAtPoint(worldX, worldY);
    if (epHit) {
      this.canvas.style.cursor = 'crosshair';
      return;
    }

    const hit = this.getHandleAtPoint(worldX, worldY);

    if (hit) {
      const cursorMap: Record<string, string> = {
        nw: 'nwse-resize',
        n: 'ns-resize',
        ne: 'nesw-resize',
        e: 'ew-resize',
        se: 'nwse-resize',
        s: 'ns-resize',
        sw: 'nesw-resize',
        w: 'ew-resize',
      };
      this.canvas.style.cursor = cursorMap[hit.handle];
    } else {
      // Check if hovering over a draggable node
      const nodeHit = this.scene.hitTest(worldX, worldY);
      this.canvas.style.cursor = nodeHit ? 'move' : 'default';
    }
  };

  private renderHandles() {
    const selectedNodes = this.scene.nodes.filter(n => n.isSelected && !(n instanceof TextNode) && !(n instanceof LineNode));
    if (selectedNodes.length === 0) return;

    const size = Editor.HANDLE_SIZE / this.viewport.scale;
    const radius = size / 2;
    const padding = 6 / this.viewport.scale; // Padding for the dashed box

    this.ctx.save();
    
    for (const node of selectedNodes) {
      const { x, y, width, height } = node;

      // 1. Draw Padded Dashed Box
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#60a5fa'; // Light blue (Tailwind blue-400)
      this.ctx.lineWidth = 1 / this.viewport.scale;
      this.ctx.setLineDash([4 / this.viewport.scale, 4 / this.viewport.scale]);
      this.ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
      
      // 2. Draw Handles
      this.ctx.setLineDash([]); // Reset dash for handles
      this.ctx.strokeStyle = '#2563eb'; // Blue (Tailwind blue-600)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.lineWidth = 1.5 / this.viewport.scale;

      // 8 handles
      const positions = [
        { x: x, y: y },                         // nw
        { x: x + width / 2, y: y },             // n
        { x: x + width, y: y },                 // ne
        { x: x + width, y: y + height / 2 },    // e
        { x: x + width, y: y + height },        // se
        { x: x + width / 2, y: y + height },    // s
        { x: x, y: y + height },                // sw
        { x: x, y: y + height / 2 },            // w
      ];

      for (const pos of positions) {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
    this.ctx.restore();
  }

  private getHandleAtPoint(x: number, y: number): { node: SceneNode, handle: HandlePosition } | null {
    const selectedNodes = this.scene.nodes.filter(n => n.isSelected && !(n instanceof TextNode) && !(n instanceof LineNode));
    const size = Editor.HANDLE_SIZE / this.viewport.scale;
    const half = size / 2;

    // Check handles
    for (const node of selectedNodes) {
      const { x: nx, y: ny, width, height } = node;
      const handles: { pos: HandlePosition, x: number, y: number }[] = [
        { pos: 'nw', x: nx, y: ny },
        { pos: 'n',  x: nx + width / 2, y: ny },
        { pos: 'ne', x: nx + width, y: ny },
        { pos: 'e',  x: nx + width, y: ny + height / 2 },
        { pos: 'se', x: nx + width, y: ny + height },
        { pos: 's',  x: nx + width / 2, y: ny + height },
        { pos: 'sw', x: nx, y: ny + height },
        { pos: 'w',  x: nx, y: ny + height / 2 },
      ];

      for (const h of handles) {
        if (x >= h.x - half && x <= h.x + half && y >= h.y - half && y <= h.y + half) {
          return { node, handle: h.pos };
        }
      }
    }
    return null;
  }

  private startResize(e: MouseEvent, hit: { node: SceneNode, handle: HandlePosition }) {
    const { node, handle } = hit;
    const startX = e.clientX;
    const startY = e.clientY;
    
    const initialRaw = { x: node.x, y: node.y, w: node.width, h: node.height };
    
    let initialPoints: {x: number, y: number}[] | null = null;
    if (node instanceof FreehandNode) {
      // Deep copy points
      initialPoints = node.points.map(p => ({ ...p }));
    }

    const onMove = (ev: MouseEvent) => {
        // Calculate delta in world coordinates
        // We can't just subtract screen coordinates because scale matters
        // Delta World = Delta Screen / Scale
        const scale = this.viewport.scale;
        const dx = (ev.clientX - startX) / scale;
        const dy = (ev.clientY - startY) / scale;

        let newX = initialRaw.x;
        let newY = initialRaw.y;
        let newW = initialRaw.w;
        let newH = initialRaw.h;

        // Apply constraints and logic
        // Minimum size
        const minSize = 10;

        switch (handle) {
          case 'nw':
            newX = Math.min(initialRaw.x + dx, initialRaw.x + initialRaw.w - minSize);
            newY = Math.min(initialRaw.y + dy, initialRaw.y + initialRaw.h - minSize);
            newW = initialRaw.w - (newX - initialRaw.x);
            newH = initialRaw.h - (newY - initialRaw.y);
            break;
          case 'n':
            newY = Math.min(initialRaw.y + dy, initialRaw.y + initialRaw.h - minSize);
            newH = initialRaw.h - (newY - initialRaw.y);
            break;
          case 'ne':
            newY = Math.min(initialRaw.y + dy, initialRaw.y + initialRaw.h - minSize);
            newH = initialRaw.h - (newY - initialRaw.y);
            newW = Math.max(initialRaw.w + dx, minSize);
            break;
          case 'e':
            newW = Math.max(initialRaw.w + dx, minSize);
            break;
          case 'se':
            newW = Math.max(initialRaw.w + dx, minSize);
            newH = Math.max(initialRaw.h + dy, minSize);
            break;
          case 's':
            newH = Math.max(initialRaw.h + dy, minSize);
            break;
          case 'sw':
             newX = Math.min(initialRaw.x + dx, initialRaw.x + initialRaw.w - minSize);
             newW = initialRaw.w - (newX - initialRaw.x);
             newH = Math.max(initialRaw.h + dy, minSize);
             break;
          case 'w':
             newX = Math.min(initialRaw.x + dx, initialRaw.x + initialRaw.w - minSize);
             newW = initialRaw.w - (newX - initialRaw.x);
             break;
        }

        if (node instanceof FreehandNode && initialPoints) {
           const scaleX = newW / initialRaw.w;
           const scaleY = newH / initialRaw.h;
           // Protect against zero division or zero size
           if (initialRaw.w > 0 && initialRaw.h > 0) {
             node.points = initialPoints.map(p => ({
               x: p.x * scaleX,
               y: p.y * scaleY
             }));
           }
        }

        node.x = newX;
        node.y = newY;
        node.width = newW;
        node.height = newH;

        // Follow logic: update any lines bound to this resized node
        this.updateLineBindings();

        this.render();
    };

    const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        this.emitChange();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Helper for shortcuts
  onKeyDown = (e: KeyboardEvent) => {
    // Skip shortcuts when editing text inline
    if (this.isEditingText) return;

    // Delete/Backspace: delete selected nodes
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.deleteSelected();
      return;
    }

    // Undo: Ctrl+Z
    // Redo: Ctrl+Shift+Z or Ctrl+Y
    if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                this.redo();
            } else {
                this.undo();
            }
        } else if (e.key.toLowerCase() === 'y') {
            e.preventDefault();
            this.redo();
        } else if (e.key.toLowerCase() === 'g') {
            e.preventDefault();
            if (e.shiftKey) {
                this.ungroupSelected();
            } else {
                this.groupSelected();
            }
        } else if (e.key.toLowerCase() === 'c') {
            e.preventDefault();
            this.copySelected();
        } else if (e.key.toLowerCase() === 'v') {
            e.preventDefault();
            this.pasteClipboard();
        } else if (e.key.toLowerCase() === 'd') {
            e.preventDefault();
            this.duplicateSelected();
        }
    }
  };

  // ============ Delete Selected ============

  deleteSelected() {
    const selected = this.scene.nodes.filter(n => n.isSelected);
    if (selected.length === 0) return;
    for (const node of selected) {
      this.scene.removeNode(node.id);
    }
    this.render();
    this.emitChange();
  }

  // ============ Double-click Text Editing ============

  onDblClick = (e: MouseEvent) => {
    const { x: worldX, y: worldY } = this.viewport.screenToWorld(e.offsetX, e.offsetY);
    const hit = this.scene.hitTest(worldX, worldY);
    if (!hit) return;

    // Select the node
    this.scene.nodes.forEach(n => n.isSelected = false);
    hit.isSelected = true;
    this.render();
    this.emitChange();

    if (hit instanceof TextNode) {
      this.startTextEditing(hit);
    } else if (hit instanceof RectNode || hit instanceof CircleNode || hit instanceof LineNode) {
      this.startLabelEditing(hit);
    }
  };

  private startTextEditing(node: TextNode) {
    this.isEditingText = true;

    // Calculate screen position of the text node
    const t = this.viewport.transform;
    const screenX = node.x * t[0] + t[4];
    const screenY = node.y * t[3] + t[5];
    const scale = this.viewport.scale;

    // Create overlay textarea
    const textarea = document.createElement('textarea');
    textarea.value = node.text;
    textarea.style.cssText = `
      position: absolute;
      left: ${screenX}px;
      top: ${screenY}px;
      font-size: ${node.fontSize * scale}px;
      font-family: sans-serif;
      color: ${node.color};
      background: rgba(255,255,255,0.95);
      border: 2px solid #0066cc;
      border-radius: 4px;
      padding: 4px 6px;
      outline: none;
      resize: none;
      min-width: 80px;
      min-height: ${node.fontSize * scale + 12}px;
      z-index: 1000;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      line-height: 1.3;
      overflow: hidden;
    `;

    // Position relative to canvas parent
    const parent = this.canvas.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';
    parent.appendChild(textarea);

    // Auto-resize height
    const autoResize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    autoResize();
    textarea.addEventListener('input', autoResize);

    // Focus and select all
    textarea.focus();
    textarea.select();

    // Commit on blur
    const commit = () => {
      const newText = textarea.value.trim();
      if (newText.length > 0) {
        node.text = newText;
      }
      textarea.removeEventListener('blur', commit);
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.remove();
      this.isEditingText = false;
      this.render();
      this.emitChange();
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        // Cancel: revert
        textarea.removeEventListener('blur', commit);
        textarea.removeEventListener('keydown', onKeyDown);
        textarea.remove();
        this.isEditingText = false;
        this.render();
        return;
      }
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault();
        commit();
      }
      // Plain Enter = natural newline (textarea default)
    };

    textarea.addEventListener('blur', commit);
    textarea.addEventListener('keydown', onKeyDown);
  }

  private startLabelEditing(node: RectNode | CircleNode | LineNode) {
    this.isEditingText = true;

    const t = this.viewport.transform;
    const scale = this.viewport.scale;

    // Position at center of node (or midpoint for line)
    let centerX: number, centerY: number;
    if (node instanceof LineNode) {
      centerX = (node.x + node.endX) / 2;
      centerY = (node.y + node.endY) / 2;
    } else {
      centerX = node.x + node.width / 2;
      centerY = node.y + node.height / 2;
    }

    const screenX = centerX * t[0] + t[4];
    const screenY = centerY * t[3] + t[5];

    const fontSize = (node instanceof LineNode ? node.labelFontSize : node.labelFontSize) * scale;

    const textarea = document.createElement('textarea');
    textarea.value = node.label;
    textarea.placeholder = 'Enter label...';
    textarea.style.cssText = `
      position: absolute;
      left: ${screenX - 60}px;
      top: ${screenY - 14}px;
      width: 120px;
      font-size: ${fontSize}px;
      font-family: sans-serif;
      color: ${node instanceof LineNode ? node.labelColor : node.labelColor};
      background: rgba(255,255,255,0.97);
      border: 2px solid #0066cc;
      border-radius: 4px;
      padding: 4px 6px;
      outline: none;
      resize: none;
      text-align: center;
      min-height: ${fontSize + 12}px;
      z-index: 1000;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      line-height: 1.3;
      overflow: hidden;
    `;

    const parent = this.canvas.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';
    parent.appendChild(textarea);

    const autoResize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    autoResize();
    textarea.addEventListener('input', autoResize);

    textarea.focus();
    textarea.select();

    const commit = () => {
      node.label = textarea.value.trim();
      textarea.removeEventListener('blur', commit);
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.remove();
      this.isEditingText = false;
      this.render();
      this.emitChange();
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        textarea.removeEventListener('blur', commit);
        textarea.removeEventListener('keydown', onKeyDown);
        textarea.remove();
        this.isEditingText = false;
        this.render();
        return;
      }
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault();
        commit();
      }
      // Plain Enter = natural newline (textarea default)
    };

    textarea.addEventListener('blur', commit);
    textarea.addEventListener('keydown', onKeyDown);
  }

  // ============ Line Endpoint Drag & Snap ============

  private getLineEndpointAtPoint(x: number, y: number): { node: LineNode, endpoint: 'start' | 'end' } | null {
    const tolerance = 8 / this.viewport.scale;
    for (let i = this.scene.nodes.length - 1; i >= 0; i--) {
      const n = this.scene.nodes[i];
      if (!(n instanceof LineNode)) continue;
      // Check start point
      if (Math.hypot(x - n.x, y - n.y) <= tolerance) {
        return { node: n, endpoint: 'start' };
      }
      // Check end point
      if (Math.hypot(x - n.endX, y - n.endY) <= tolerance) {
        return { node: n, endpoint: 'end' };
      }
    }
    return null;
  }

  /** Get all snap target points with binding info */
  private getSnapTargetsWithBinding(): { x: number; y: number; nodeId: string; handle: LineBinding['handle'] }[] {
    const handleNames: LineBinding['handle'][] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const targets: { x: number; y: number; nodeId: string; handle: LineBinding['handle'] }[] = [];
    for (const node of this.scene.nodes) {
      if (node instanceof TextNode || node instanceof LineNode) continue;
      const { x, y, width, height } = node;
      const positions = [
        { x: x, y: y },
        { x: x + width / 2, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height / 2 },
        { x: x + width, y: y + height },
        { x: x + width / 2, y: y + height },
        { x: x, y: y + height },
        { x: x, y: y + height / 2 },
      ];
      positions.forEach((pos, i) => {
        targets.push({ ...pos, nodeId: node.id, handle: handleNames[i] });
      });
    }
    return targets;
  }

  private startEndpointDrag(_e: MouseEvent, hit: { node: LineNode, endpoint: 'start' | 'end' }) {
    const { node, endpoint } = hit;
    const snapTargets = this.getSnapTargetsWithBinding();
    const snapDist = Editor.SNAP_DISTANCE / this.viewport.scale;
    let snappedTarget: { nodeId: string; handle: LineBinding['handle'] } | null = null;

    const onMove = (ev: MouseEvent) => {
      let { x: wx, y: wy } = this.viewport.screenToWorld(ev.offsetX, ev.offsetY);
      snappedTarget = null;

      // Snap check
      for (const t of snapTargets) {
        if (Math.hypot(wx - t.x, wy - t.y) <= snapDist) {
          wx = t.x;
          wy = t.y;
          snappedTarget = { nodeId: t.nodeId, handle: t.handle };
          break;
        }
      }

      if (endpoint === 'start') {
        const endX = node.x + node.width;
        const endY = node.y + node.height;
        node.x = wx;
        node.y = wy;
        node.width = endX - wx;
        node.height = endY - wy;
      } else {
        node.width = wx - node.x;
        node.height = wy - node.y;
      }
      this.render();
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      // Save or clear binding
      if (endpoint === 'start') {
        node.startBinding = snappedTarget ? { nodeId: snappedTarget.nodeId, handle: snappedTarget.handle } : null;
      } else {
        node.endBinding = snappedTarget ? { nodeId: snappedTarget.nodeId, handle: snappedTarget.handle } : null;
      }

      this.emitChange();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // ============ Line Binding Follow Logic ============

  /** Resolve a binding to a world-space point */
  private resolveBinding(binding: LineBinding): { x: number; y: number } | null {
    const target = this.scene.nodes.find(n => n.id === binding.nodeId);
    if (!target) return null;
    const { x, y, width, height } = target;
    const map: Record<string, { x: number; y: number }> = {
      nw: { x, y },
      n:  { x: x + width / 2, y },
      ne: { x: x + width, y },
      e:  { x: x + width, y: y + height / 2 },
      se: { x: x + width, y: y + height },
      s:  { x: x + width / 2, y: y + height },
      sw: { x, y: y + height },
      w:  { x, y: y + height / 2 },
    };
    return map[binding.handle] ?? null;
  }

  /** Update all line endpoints that have bindings */
  updateLineBindings() {
    for (const n of this.scene.nodes) {
      if (!(n instanceof LineNode)) continue;
      if (n.startBinding) {
        const pt = this.resolveBinding(n.startBinding);
        if (pt) {
          const endX = n.x + n.width;
          const endY = n.y + n.height;
          n.x = pt.x;
          n.y = pt.y;
          n.width = endX - pt.x;
          n.height = endY - pt.y;
        } else {
          n.startBinding = null; // target deleted
        }
      }
      if (n.endBinding) {
        const pt = this.resolveBinding(n.endBinding);
        if (pt) {
          n.width = pt.x - n.x;
          n.height = pt.y - n.y;
        } else {
          n.endBinding = null;
        }
      }
    }
  }
}

// Helper Types
type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

import { SceneNode } from '../scene/SceneNode';
