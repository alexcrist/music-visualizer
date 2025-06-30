import { useCallback, useState } from "react";
import AudioCapture from "../audio/AudioCapture/AudioCapture";
import AudioOutput from "../audio/AudioOutput/AudioOutput";
import { processAudioData } from "../audio/extractAudioFeatures";
import Visualizer from "../visualizers/Visualizer/Visualizer";
import { drawVolumeVisualizer } from "../visualizers/drawVolumeVisualizer";
import styles from "./App.module.css";

const App = () => {
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [audioData, setAudioData] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [audioStream, setAudioStream] = useState(null);

  const handleAudioData = useCallback(
    (audioData) => {
      setAudioData(audioData);
      const sampleRate = audioData?.sampleRate;
      const bufferLength = audioData?.bufferLength;
      const newDelaySeconds = bufferLength / sampleRate;
      if (delaySeconds !== newDelaySeconds) {
        setDelaySeconds(newDelaySeconds);
      }
      const features = processAudioData(audioData);
      setAudioFeatures(features);
    },
    [delaySeconds]
  );

  const handleAudioStream = useCallback((streamInfo) => {
    setAudioStream(streamInfo);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Music Visualizer</h1>
      <AudioCapture
        onAudioData={handleAudioData}
        onAudioStream={handleAudioStream}
      />

      <AudioOutput
        audioContext={audioStream?.audioContext}
        sourceNode={audioStream?.source}
        delaySeconds={delaySeconds}
      />

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
          <p>Delay: {Math.round(delaySeconds * 1000)} ms</p>
        </div>
      )}
    </div>
  );
};

export default App;
