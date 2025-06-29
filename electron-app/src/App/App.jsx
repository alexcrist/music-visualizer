import { useState } from "react";
import AudioCapture from "../audio/AudioCapture/AudioCapture";
import useAudioProcessor from "../audio/useAudioProcessor";
import Visualizer from "../visualizers/Visualizer/Visualizer";
import { drawVolumeVisualizer } from "../visualizers/drawVolumeVisualizer";
import styles from "./App.module.css";

const App = () => {
  const [audioData, setAudioData] = useState(null);

  const handleAudioData = (data) => {
    setAudioData(data);
  };

  // Use the audio processor hook
  const audioFeatures = useAudioProcessor(audioData, {
    bufferCount: 10,
    overlapRatio: 0.5,
  });

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

      {/* Debug Info */}
      {audioFeatures && (
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
          <h4>Debug Info:</h4>
          <p>
            Current Volume:{" "}
            {Math.round((audioFeatures.current?.volume || 0) * 100)}%
          </p>
          <p>History Length: {audioFeatures.history?.length || 0}</p>
          <p>
            Buffer Count: {audioFeatures.bufferInfo?.totalBuffers || 0}/
            {audioFeatures.bufferInfo?.maxBuffers || 0}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
