# KoBoard 🎨

KoBoard 是一个基于 HTML5 Canvas 和 React 的高性能矢量绘图白板引擎。它支持无限画布、智能连线和多人协作（开发中），旨在提供流畅的图表绘制与思维导图体验。

## ✨ 核心特性 (Features)

### 🖥️ 核心引擎
- **无限画布**：基于矩阵变换的视口系统，支持无限制的平移 (Pan) 与缩放 (Zoom)。
- **高性能渲染**：优化的 Canvas 2D 渲染管线，支持逻辑像素与设备像素比 (DPR) 适配。
- **数据持久化**：支持 JSON 序列化/反序列化，自动保存至 LocalStorage。

### 🛠️ 绘图工具
- **基础图元**：支持矩形、圆形、文本、直线等矢量图形。
- **智能连线**：直线支持**端点吸附**与**动态绑定**，拖动节点时连线自动跟随。
- **文本编辑**：支持双击 Canvas 上的文本进行原地编辑 (WYSIWYG)。

### 🎮 交互体验
- **选择系统**：支持点击单选、Shift 加选。
- **变形控制**：提供 8 点变形手柄 (Transformer)，支持任意尺寸调整。
- **对齐分布**：支持多选物体的左对齐、居中、垂直分布等 6 种排版操作。
- **层级管理**：支持图元置顶、置底及层级微调。
- **撤销重做**：内置完备的历史记录栈 (Undo/Redo Stack)。

## 🚀 快速开始 (Getting Started)

### 环境要求
- Node.js >= 16
- pnpm (推荐)

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问 `http://localhost:5173` 即可看到画板。

## 🏗️ 架构设计 (Architecture)

项目采用核心逻辑与 UI 分离的架构：

* **@koboard/editor**: 核心 Canvas 引擎，不依赖任何 UI 框架。
* `core/`: 核心控制器 (Editor, Viewport)
* `scene/`: 场景图与节点定义 (Scene, SceneNode)
* `utils/`: 数学运算与辅助工具


* **apps/web**: 基于 React 的用户界面层，通过事件订阅与 Editor 交互。

## ⌨️ 快捷键 (Shortcuts)

| 按键 | 功能 |
| --- | --- |
| `Ctrl` + `滚轮` | 缩放画布 |
| `鼠标中键` / `Space`+拖拽 | 平移画布 |
| `Ctrl` + `Z` | 撤销 |
| `Delete` / `Backspace` | 删除选中物体 |
| `Double Click` | 编辑文本 |

## 📅 开发计划 (Roadmap)

* [x] Phase 1: 核心引擎与基础图元
* [x] Phase 2: 连线绑定与高级交互
* [ ] Phase 3: AI 辅助生成 (Text-to-Diagram)
* [ ] Phase 4: 多人实时协作 (CRDT/Yjs)

