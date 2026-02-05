import { Canvas } from "./components/Canvas";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Canvas />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(196, 99, 99, 0.6)",
          padding: 10,
          borderRadius: 4,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <strong>KoBoard Core</strong>
        <br />
        <small>Shift + Drag to Pan</small>
        <br />
        <small>Ctrl + Scroll to Zoom</small>
        <br />
        <small>Click to Select</small>
      </div>
    </div>
  );
}

export default App;
