import { Canvas } from "@/components/Canvas";
import Layout from "@/components/Layout";
import { AICommandPalette } from "@/components/panels/AICommandPalette";

function App() {
  return (
    <Layout>
      <Canvas />
      <AICommandPalette />
    </Layout>
  );
}

export default App;
