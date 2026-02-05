import { Viewport } from './Viewport';
import { Scene } from '../scene/Scene';
import { RectNode, TextNode } from '../scene/SceneNode';

export class Editor {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  scene: Scene; // [NEW]
  width: number = 0;
  height: number = 0;
  
  // Callbacks
  private listeners: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.viewport = new Viewport();
    this.scene = new Scene(); // [NEW]
    
    // Test Shapes
    const rect = new RectNode('rect1');
    rect.x = 100; rect.y = 100;
    this.scene.addNode(rect);

    const text = new TextNode('text1');
    text.x = 300; text.y = 100;
    this.scene.addNode(text);

    this.resize();
    window.addEventListener('resize', this.resize);
    
    // Binding events
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    
    this.render();
  }

  dispose() {
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
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
         };

         window.addEventListener('mousemove', onMove);
         window.addEventListener('mouseup', onUp);
       } else {
         // Handle Selection & Drag
         const { x: worldX, y: worldY } = this.viewport.screenToWorld(e.offsetX, e.offsetY);
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
                
                // Snapshot original positions of all selected nodes
                const initialPositions = this.scene.nodes
                   .filter(n => n.isSelected)
                   .map(n => ({ node: n, startX: n.x, startY: n.y }));
                
                const onDragMove = (ev: MouseEvent) => {
                    const { x: currX, y: currY } = this.viewport.screenToWorld(ev.offsetX, ev.offsetY);
                    const dx = currX - startX;
                    const dy = currY - startY;

                    initialPositions.forEach(({ node, startX: nx, startY: ny }) => {
                        node.x = nx + dx;
                        node.y = ny + dy;
                    });
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
            // Click on empty space: Clear selection
            if (!e.shiftKey) {
                this.scene.nodes.forEach(n => n.isSelected = false);
                this.render();
                this.emitChange();
            }
         }
       }
    }
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

    // Draw Grid (Infinite)
    this.drawGrid();

    // Draw Scene
    this.scene.render(this.ctx);

    this.ctx.restore();
  };

  drawGrid() {
    // Determine visible area in world coordinates
    const topLeft = this.viewport.screenToWorld(0, 0);
    const bottomRight = this.viewport.screenToWorld(this.width, this.height);
    
    const step = 50;
    const startX = Math.floor(topLeft.x / step) * step;
    const endX = Math.ceil(bottomRight.x / step) * step;
    const startY = Math.floor(topLeft.y / step) * step;
    const endY = Math.ceil(bottomRight.y / step) * step;

    this.ctx.beginPath();
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1 / this.viewport.scale; // Maintain 1px width

    for (let x = startX; x <= endX; x += step) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += step) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }
    this.ctx.stroke();
  }

  // Event System
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitChange() {
    this.listeners.forEach(l => l());
  }
  
  // Override render to emit change? 
  // Probably too frequent. Better to emit on specific actions (add, select, dragEnd).
  // For now, let's call emitChange manually in actions.
}
