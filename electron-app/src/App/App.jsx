import { useState } from "react";
import AudioCapture from "../audio/AudioCapture/AudioCapture";
import { processAudioData } from "../audio/extractAudioFeatures";
import Visualizer from "../visualizers/Visualizer/Visualizer";
import { drawVolumeVisualizer } from "../visualizers/drawVolumeVisualizer";
import styles from "./App.module.css";

const App = () => {
  const [audioData, setAudioData] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);

  const handleAudioData = (audioData) => {
    setAudioData(audioData);
    const features = processAudioData(audioData);
    setAudioFeatures(features);
  };

  return (
    <div className={styles.container}>
      <h1>Music Visualizer</h1>
      <AudioCapture onAudioData={handleAudioData} />

      {/* Visualizer */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h3>Volume Visualizer</h3>
        <Visualizer
          features={audioFeatures}
          drawFunction={drawVolumeVisualizer}
          drawOptions={{
            color: "#00ff88",
            backgroundColor: "#000",
          }}
          width={400}
          height={300}
        />
      </div>

      {/* Audio Configuration Info */}
      {audioData && (
        <div style={{ marginTop: "20px", fontSize: "14px", color: "#333" }}>
          <h4>Audio Configuration:</h4>
          <p>Sample Rate: {audioData.sampleRate} Hz</p>
          <p>Buffer Length: {audioData.bufferLength}</p>
          <p>
            First 10 Frequency Values:{" "}
            {audioData.frequencyData.slice(0, 10).join(", ")}
          </p>
        </div>
      )}

      {/* Debug Info */}
      {audioFeatures && (
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
          <h4>Debug Info:</h4>
          <p>
            Current Volume:{" "}
            {Math.round((audioFeatures.current?.volume || 0) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
